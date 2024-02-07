import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Socket, io } from 'socket.io-client';
import { useGlobal } from './GlobalContext';
import AccessComponent from './access';
import BodyComponent from './components/body/Body';
import { ChatProvider } from './components/chat/ChatContext';
import Game from './components/game/Game';
import Header from './components/header/Header';
// import dotenv from 'dotenv';

// dotenv.config();

interface Game {
	gameId: number;
	playerOneLogin: string,
	playerTwoLogin: string,
	playerOneID: string;
	playerTwoID: string;
	scoreOne: number;
	scoreTwo: number;
}

interface FriendRequestDto {
	recipientLogin: string;
	initiatorID: number;
	initiatorLogin: string;
}

interface GameInviteDto {
	senderUserID: number;
}

interface GameInviteUserTwoDto {
	userTwoId: number;
	userTwoGameId: string
}

const GeneralComponent = () => {

	const { globalState, dispatch } = useGlobal();
	const [showLogin, setShowLogin] = useState(true);
	const [show2FAForm, setShow2FAForm] = useState(false);
	const [authValidated, setAuthValidated] = useState(false);
	const [Game, setGame] = useState<Game>();

	const searchParams = useSearchParams();
	const code = searchParams.get('code');

	// GAME INVITE

	// si j'inivte est ce que je peux check que j'ai bien invite?
	const gameInviteValidation = (gameInviteDto: GameInviteDto) => {
		globalState.userSocket?.off('usersNotInGame');
		globalState.userSocket?.emit('checkAndsetInGame', {
			opponentUserId: gameInviteDto.senderUserID,
		})
		globalState.userSocket?.on('usersNotInGame', (userId: number) => {
			const gameSocket = io(`${process.env.API_URL}/game`, {
				autoConnect: false,
				auth: {
					token: sessionStorage.getItem("jwt"),
				}
			});
			gameSocket.connect();
			dispatch({ type: 'SET_GAME_SOCKET', payload: gameSocket });
			gameSocket.on('connect', () => {
				globalState.userSocket?.emit('inviteAccepted', {
					otherUserId: gameInviteDto.senderUserID,
					userGameSocketId: gameSocket.id,
				});
			});
			return;
		})
	}

	const gameInviteClosed = (targetUserId: number) => {
		//le timeout qui etait precedemment dans le toast 
		//faisais demarrer le jeu en différé est n'envoyé pas l'emit en meme temps que le toast se fermait
		//je sais pas si c'etait fais expres
		//mais jy ai trouvé aucune utilité ca pouvais meme poser des problemes
		//mais ca strouve j'ai raté qqch
		globalState.userSocket?.emit('inviteClosed', targetUserId)
	}

	const gameInviteDeny = (gameInviteDto: GameInviteDto) => { 
		globalState.userSocket?.emit('inviteDenied', {
			senderUserId: gameInviteDto.senderUserID,
		});
	}

	const GameInviteNotification = ({ closeToast, toastProps, gameInviteDto }: any) => {
		return (
			<div className='toast-container'>
				You received a game invite from {gameInviteDto.senderUsername}
				<div className='bloc-toast-button'>
					<div className='toast-yes' onClick={() => {
						gameInviteValidation(gameInviteDto);
						closeToast();
					}}>
						Accept
					</div>
					<div className='toast-no' onClick={() => {
						gameInviteDeny(gameInviteDto);
						closeToast();
					}}>
						Deny
					</div>
				</div>
			</div>
		);
	};

	// FRIEND REQUEST
	const friendRequestValidation = async (friendRequestDto: FriendRequestDto) => {

		const response = await fetch(`${process.env.API_URL}/users/acceptFriendRequest`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
			},
			body: JSON.stringify(friendRequestDto),
		});

		if (response.ok) {
			const conversationData = await response.json();
			if (globalState.userSocket?.connected) {
				globalState.userSocket?.emit('friendRequestAccepted', {
					roomName: conversationData.name,
					roomID: conversationData.id,
					initiator: friendRequestDto.initiatorLogin,
					recipient: friendRequestDto.recipientLogin,
				});
				globalState.userSocket?.emit('joinRoom', { roomName: conversationData.name, roomID: conversationData.id });
			}
		}
		else {
			const error = await response.json();
			if (Array.isArray(error.message))
				toast.warn(error.message[0]);
			else
				toast.warn(error.message);
		}
	};

	const friendRequestDeny = async (friendRequestDto: FriendRequestDto) => {

		const deleteFriendRequestDto = {
			friendID: 0,
		}

		const response = await fetch(`${process.env.API_URL}/users/deleteFriendRequest`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
			},
			body: JSON.stringify(deleteFriendRequestDto),
		});

		if (response.ok) {
			console.log("Friend request denied");
		}
		else {
			const error = await response.json();
			if (Array.isArray(error.message))
				toast.warn(error.message[0]);
			else
				toast.warn(error.message);
		}
		return;
	};


	// sinon on peut deny que dans la notif
	const FriendRequestReceived = ({ closeToast, toastProps, friendRequestDto }: any) => (
		<div>
			You received a friend request from  {friendRequestDto.initiatorLogin}
			<button style={{ padding: '5px ' }} onClick={() => {
				friendRequestValidation(friendRequestDto);
				closeToast();
			}}>
				Accept
			</button>
			{/* <button style={{ padding: '5px ' }} onClick={() => {
				friendRequestDeny(friendRequestDto)
				closeToast();
			}}>
				Deny
			</button> */}
		</div>
	)

	const FriendRequestAccepted = ({ closeToast, toastProps, friend }: any) => (
		<div>
			{friend} has accepted your friend request!
			<button onClick={closeToast}>Understand!</button>
		</div>
	)

	const setUserSession = async (jwt: string) => {

		const jwtArray = jwt?.split('.');
		if (jwtArray.length != 0) {
			const payload = JSON.parse(atob(jwtArray[1]));
			sessionStorage.setItem("currentUserID", payload.sub);
			sessionStorage.setItem("2fa", payload.tfa_enabled);
			if (payload.username === payload.login)
				sessionStorage.setItem("currentUserLogin", payload.login);
			else
				sessionStorage.setItem("currentUserLogin", payload.username);
		}
	}

	const userReconnects = () => {

		if (sessionStorage.getItem("jwt")) {
			const userSocket = io(`${process.env.API_URL}/user`, {
				autoConnect: false,
				auth: {
					token: sessionStorage.getItem("jwt"),
				}
			});
			userSocket.connect();
			dispatch({ type: 'SET_SOCKET', payload: userSocket });
			setAuthValidated(true);
			return true;
		}

		return false;
	}

	const handleAccessToken = async (code: any): Promise<boolean> => {

		if (userReconnects())
			return true;

		const response = await fetch(`${process.env.API_URL}/auth/access`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ code }),
		});

		if (response.ok) {

			const token = await response.json();
			sessionStorage.setItem("jwt", token.access_token);
			if (token.access_token) {
				await setUserSession(token.access_token);
				const userSocket = io(`${process.env.API_URL}/user`, {
					autoConnect: false,
					auth: {
						token: token.access_token,
					}
				});
				userSocket.connect();
				dispatch({ type: 'SET_SOCKET', payload: userSocket });
				if (globalState.activate2FA)
					dispatch({ type: 'ACTIVATE', payload: 'show2FA' });
			}
		} else {
			const error = await response.json();
			if (Array.isArray(error.message))
				toast.warn(error.message[0]);
			else
				toast.warn(error.message);
		}

		return false;
	}

	// UserSocket multi-purpose useEffect
	useEffect(() => {

		// Works on both connection and reconnection
		globalState.userSocket?.on('connect', () => {
			const personnalRoom = sessionStorage.getItem("currentUserLogin");
			globalState.userSocket?.emit('joinPersonnalRoom', personnalRoom, sessionStorage.getItem("currentUserID"));
		})

		globalState.userSocket?.on('disconnect', () => { })

		globalState.userSocket?.on('refreshUserOnlineState', (notif: string) => {
			console.log("Friend online status event (general.tsx) --> ", notif);
			toast.info(notif);
		});

		globalState.userSocket?.on('friendRequest', (friendRequestDto: FriendRequestDto) => {
			toast(<FriendRequestReceived friendRequestDto={friendRequestDto} />, {
				pauseOnFocusLoss: false,
			});
		});

		globalState.userSocket?.on('friendRequestAcceptedNotif', (data: { roomName: string, roomID: string, recipient: string }) => {
			const { roomName, roomID, recipient } = data;
			toast(<FriendRequestAccepted friend={recipient} />, {
				pauseOnFocusLoss: false,
			});
			globalState.userSocket?.emit('joinRoom', { roomName: roomName, roomID: roomID });
		})

		globalState.userSocket?.on('userIsBan', (data: { roomName: string, roomID: string }) => {
			const { roomName, roomID } = data;
			if (roomName && roomID) {
				globalState.userSocket?.emit('leaveRoom', { roomName: roomName, roomID: roomID });
				toast.warn(`You are ban from ${roomName}`);
			}
		});

		globalState.userSocket?.on('userIsUnban', (data: { roomName: string, roomID: string }) => {
			const { roomName, roomID } = data;
			if (roomName && roomID) {
				globalState.userSocket?.emit('joinRoom', { roomName: roomName, roomID: roomID });
				toast.warn(`You are unban from ${roomName}`);
			}
		});

		globalState.userSocket?.on('kickUser', (data: { roomName: string, roomID: string }) => {
			const { roomName, roomID } = data;
			globalState.userSocket?.emit('leaveRoom', { roomName: roomName, roomID: roomID });
		});

		globalState.userSocket?.on('userAddedToRoom', (data: { convID: number, convName: string }) => {
			const { convID, convName } = data;
			globalState.userSocket?.emit('joinRoom', { roomName: convName, roomID: convID });
		});

		globalState.userSocket?.on('gameInvite', (gameInviteDto: GameInviteDto) => {
			toast(<GameInviteNotification gameInviteDto = {gameInviteDto} />,
				{
					pauseOnFocusLoss: false,
					autoClose: 5000,
					onClose: props => gameInviteClosed(gameInviteDto.senderUserID),
				});
		});

		return () => {
			globalState.userSocket?.off('connect');
			globalState.userSocket?.off('disconnect');
			globalState.userSocket?.off('refreshUserOnlineState');
			globalState.userSocket?.off('friendRequest');
			globalState.userSocket?.off('friendRequestAcceptedNotif');
			globalState.userSocket?.off('userIsUnban');
			globalState.userSocket?.off('userIsBan');
			globalState.userSocket?.off('kickUser');
			globalState.userSocket?.off('userAddedToRoom');
			globalState.userSocket?.off('gameInvite');
		}

	}, [globalState?.userSocket]);

	// GAME INVITE

	useEffect(() => {
		globalState.userSocket?.on('createGameInviteSocket', (GameInviteUserTwoDto: GameInviteUserTwoDto) => {
			globalState.gameSocket?.emit('launchGameInvite', { userTwoId: GameInviteUserTwoDto.userTwoId, userTwoGameId: GameInviteUserTwoDto.userTwoGameId });
		});
		return () => {
			globalState.userSocket?.off('createGameInviteSocket');
		};
	}, [globalState?.userSocket, globalState?.gameSocket]);

	useEffect(() => {

		globalState.userSocket?.on('acceptInvitation', (GameInviteUserTwoDto: GameInviteUserTwoDto) => {
			globalState.gameInviteValidation = true;
			globalState.gameSocketConnected = false;
			const gameSocket: Socket = io(`${process.env.API_URL}/game`, {
				autoConnect: false,
				auth: {
					token: sessionStorage.getItem("jwt"),
				}
			});
			gameSocket.connect();
			dispatch({ type: 'SET_GAME_SOCKET', payload: gameSocket });
			globalState.userSocket?.emit('setGameInvite', { userTwoId: GameInviteUserTwoDto.userTwoId, userTwoGameId: GameInviteUserTwoDto.userTwoGameId });
		});
		globalState.userSocket?.on('deniedInvitation', () => {
			globalState.gameSocketConnected = false;
		});
		globalState.userSocket?.on('userToInviteAlreadyInGame', () => {
			globalState.gameSocketConnected = false;

		});
		globalState.userSocket?.on('usersInGame', () => {
			console.log("================2=================")
			console.log("ON USERINGAME")
			console.log("globalState.gameInvite", globalState.gameInvite)
			console.log("globalState.gameInviteValidation", globalState.gameInviteValidation)
			console.log("globalState.gameSocketConnected", globalState.gameSocketConnected)
			globalState.gameSocketConnected = false;
		})
		globalState.userSocket?.on('userInGame', () => {
			globalState.gameSocketConnected = false;
		})
		globalState.userSocket?.on('closedInvitation', () => {
			if (globalState.gameInviteValidation == false) {
				globalState.gameSocketConnected = false;
			}
			globalState.gameSocketConnected = false;
		});

		// this.server.to(client.id).emit('badsenderIdGameInvite');
		globalState.userSocket?.on('badsenderIdGameInvite', () => {
			globalState.gameSocket?.disconnect();
		});

		return () => {
			globalState.userSocket?.off('acceptInvitation');
			globalState.userSocket?.off('closedInvitation');
			globalState.userSocket?.off('deniedInvitation');
			globalState.userSocket?.off('userInGame');
			globalState.userSocket?.off('usersInGame');
			globalState.userSocket?.off('userToInviteAlreadyInGame');
		};

	}, [globalState?.gameSocket, globalState.gameInviteValidation, globalState?.userSocket, globalState.gameSocketConnected, globalState.userTwoIdGame, globalState.userTwoGameSocketId]);

	// Game socket handler
	useEffect(() => {

		globalState.gameSocket?.on('connect', () => {
		})

		globalState.gameSocket?.on('disconnect', () => {
			console.log('GameSocket? disconnected from the server : ', globalState.gameSocket?.id);
			globalState.gameSocketConnected = false;
		})

		globalState.gameSocket?.on('joinGame', (game: Game) => {
			setGame((prevState: Game | undefined) => ({
				...prevState,
				gameId: game.gameId,
				playerOneID: game.playerOneID,
				playerTwoID: game.playerTwoID,
				playerOneLogin: game.playerOneLogin,
				playerTwoLogin: game.playerTwoLogin,
				scoreOne: game.scoreOne,
				scoreTwo: game.scoreTwo,
			}));
			globalState.gameSocket?.emit('playerJoined', { gameId: game.gameId })
		})

		return () => {
			globalState.gameSocket?.off('connect');
			globalState.gameSocket?.off('disconnect');
			globalState.gameSocket?.off('connectionDone');
			globalState.gameSocket?.off('joinGame');
		}

	}, [globalState?.gameSocket])

	const check2faActivate = async () => {

		try {
			const response = await fetch(`${process.env.API_URL}/auth/get2fa`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
			});
			if (response.ok) {
				const data = await response.json();
				if (data)
					dispatch({ type: 'ACTIVATE', payload: 'show2FA' });
				else
					dispatch({ type: 'ACTIVATE', payload: 'isConnected' });
			}
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		}
		catch (error) {
			console.error(error);
		}
	}
	// Login form useEffect
	useEffect(() => {
		if (code) {
			handleAccessToken(code).then(result => {
				check2faActivate();
			})
		}
	}, []);

	// For testing purpose : no 42 form on connection
	// useEffect(() => {
	// 	if (sessionStorage.getItem("currentUserLogin") != null)
	// 		setShowLogin(false);
	// });

	return (
		<>
			<ToastContainer
				pauseOnHover={false}
			/>
			{!globalState.isConnected ?
				(<AccessComponent />)
				: (
					<ChatProvider>
						<Header />
						<BodyComponent />
					</ChatProvider>
				)}
		</>
	);
}
export default GeneralComponent;