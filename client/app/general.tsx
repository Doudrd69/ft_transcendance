import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { io } from 'socket.io-client';
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
	recipientID: number,
	recipientLogin: string;
	initiatorLogin: string;
}

interface GameInviteDto {
	senderUserID: number;
	senderID: string,
	senderUsername: string;
	initiatorLogin: string;
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
	const gameInviteValidation = (gameInviteDto: GameInviteDto) => {

		const gameSocket = io(`${process.env.API_URL}/game`, {
			autoConnect: false,
			auth: {
				token: sessionStorage.getItem("jwt"),
			}
		});
		gameSocket.connect();
		dispatch({ type: 'SET_GAME_SOCKET', payload: gameSocket });
		gameSocket.emit('inviteAccepted', {
			userOneId: sessionStorage.getItem("currentUserID"),
			userTwoId: gameInviteDto.senderUserID,
			playerOneLogin: sessionStorage.getItem("currentUserLogin"),
			playerTwoLogin: gameInviteDto.senderUsername,
			playerTwoId: gameInviteDto.senderID,
		});
	}

	const gameInviteClosed = (gameInviteDto: GameInviteDto) => {
		globalState.userSocket?.emit('inviteClosed', {
			senderUsername: gameInviteDto.senderUsername,
		})
	}

	const gameInviteDeny = (gameInviteDto: GameInviteDto) => {
		setTimeout(() => {
			globalState.userSocket?.emit('inviteClosed', {
				senderUsername: gameInviteDto.senderUsername,
			});
		}, 1000);
	}

	const GameInviteNotification = ({ closeToast, toastProps, gameInviteDto }: any) => (
		<div>
			You received a game invite from  {gameInviteDto.senderUsername}
			<button style={{ padding: '5px '}} onClick={() => {
				gameInviteValidation(gameInviteDto);
				closeToast();
			}}>
			Accept
			</button>
				<button style={{ padding: '5px '}} onClick={() =>  {
					gameInviteDeny(gameInviteDto);
					closeToast();
					}}>Deny</button>
		</div>
	)

	// if accept envoye un emit depuis le front pour l'autre user et si rien recu disco 

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
				globalState.userSocket?.emit('friendRequestAccepted', { roomName: conversationData.name, roomID: conversationData.id, initiator: friendRequestDto.initiatorLogin, recipient: friendRequestDto.recipientLogin });
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

	const FriendRequestReceived = ({ closeToast, toastProps, friendRequestDto }: any) => (
		<div>
			You received a friend request from  {friendRequestDto.initiatorLogin}
			<button style={{ padding: '5px ' }} onClick={() => {
				friendRequestValidation(friendRequestDto);
				closeToast();
			}}>
				Accept
			</button>
			<button style={{ padding: '5px ' }} onClick={closeToast}>Deny</button>
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

	// Multi-purpose useEffect for socket handling
	useEffect(() => {

		globalState.userSocket?.on('friendRequest', (friendRequestDto: FriendRequestDto) => {
			toast(<FriendRequestReceived friendRequestDto={friendRequestDto} />, {
				pauseOnFocusLoss: false,
			});
		});

		globalState.userSocket?.on('friendRequestAcceptedNotif', (data: { roomName: string, roomID: string, initiator: string, recipient: string }) => {
			const { roomName, roomID, initiator, recipient } = data;
			toast(<FriendRequestAccepted friend={recipient} />, {
				pauseOnFocusLoss: false,
			});
			globalState.userSocket?.emit('joinRoom', { roomName: roomName, roomID: roomID });
		})

		globalState.userSocket?.on('userJoinedRoom', (notification: string) => {
		});

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
			toast(<GameInviteNotification gameInviteDto={gameInviteDto} />,
				{
					pauseOnFocusLoss: false,
					autoClose: 5000,
					onClose: props => gameInviteClosed(gameInviteDto),
				});
		});

		return () => {
			globalState.userSocket?.off('friendRequest');
			globalState.userSocket?.off('friendRequestAcceptedNotif');
			globalState.userSocket?.off('userJoinedRoom');
			globalState.userSocket?.off('userIsUnban');
			globalState.userSocket?.off('userIsBan');
			globalState.userSocket?.off('kickUser');
			globalState.userSocket?.off('userAddedToRoom');
			globalState.userSocket?.off('gameInvite');
		}

	}, [globalState?.userSocket]);

	// Connection - Deconnection useEffect
	useEffect(() => {

		// Works on both connection and reconnection
		globalState.userSocket?.on('connect', () => {
			const personnalRoom = sessionStorage.getItem("currentUserLogin");
			globalState.userSocket?.emit('joinPersonnalRoom', personnalRoom, sessionStorage.getItem("currentUserID"));
		})

		globalState.userSocket?.on('disconnect', () => {
		})

		globalState.userSocket?.on('newConnection', (notif: string) => {
			toast(notif);
		})

		globalState.userSocket?.on('newDeconnection', (notif: string) => {
			toast(notif);
		})

		return () => {
			globalState.userSocket?.off('connect');
			globalState.userSocket?.off('disconnect');
			globalState.userSocket?.off('newConnection');
			globalState.userSocket?.off('newDeconnection');
		}

	}, [globalState?.userSocket])

	// Game socket handler
	useEffect(() => {

		globalState.gameSocket?.on('connect', () => {
		})

		globalState.gameSocket?.on('disconnect', () => {
			console.log('GameSocket? disconnected from the server : ', globalState.gameSocket?.id);
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
		console.log("check2faActivate")
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