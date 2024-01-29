import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import React, { useState , useEffect } from 'react';
import RootLayout from './layout'
import Chat from './components/chat/Chat'
import Game from './components/game/Game'
import TFAComponent from './components/TFA/TFAComponent'
import Header from './components/header/Header'
import Authentificationcomponent from './components/chat/auth/Authentification';
import { GameProvider } from './components/game/GameContext';
import { io, Socket } from 'socket.io-client'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SettingsComponent from './components/settings/Settings';
import BodyComponent from './components/body/Body';
import SetComponent from './components/Avatar/SetAvatar';
import { totalmem } from 'os';
import GameHeader from './components/game/GameHeader';
import { useGlobal } from './GlobalContext';
import { ChatProvider } from './components/chat/ChatContext';
import AccessComponent from './access';
// import { useChat } from './components/chat/ChatContext';

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

const GeneralComponent = () => {

    const { globalState, dispatch } = useGlobal();
	const [showLogin, setShowLogin] = useState(true);
	const [show2FAForm, setShow2FAForm] = useState(false);
	const [authValidated, setAuthValidated] = useState(false);
	const [Game, setGame] = useState<Game>();

	const searchParams = useSearchParams();
	const code = searchParams.get('code');

	const friendRequestValidation = async (friendRequestDto: FriendRequestDto) => {

		const response = await fetch('http://localhost:3001/users/acceptFriendRequest', {
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
				globalState.userSocket?.emit('friendRequestAccepted', {roomName: conversationData.name, roomID: conversationData.id, initiator: friendRequestDto.initiatorLogin, recipient: friendRequestDto.recipientLogin});
				globalState.userSocket?.emit('joinRoom', {roomName: conversationData.name, roomID: conversationData.id} );
			}
		}
		else {
			console.error("Fatal error: friend request failed");
		}
	};

	const FriendRequestReceived = ({ closeToast, toastProps, friendRequestDto }: any) => (
		<div>
			You received a friend request from  {friendRequestDto.initiatorLogin}
			<button style={{ padding: '5px '}} onClick={() => {
				friendRequestValidation(friendRequestDto);
				closeToast;
			}}>
			Accept
			</button>
				<button style={{ padding: '5px '}} onClick={closeToast}>Deny</button>
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
			const userSocket = io('http://localhost:3001/user', {
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

		// if (userReconnects())
		// 	return true;
		console.log('handleAccessToken');
		const response = await fetch('http://localhost:3001/auth/access', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({code}),
		});
		console.log("Access token request sent");
		if (response.ok) {
			console.log("Access token received");
			const token = await response.json();
			sessionStorage.setItem("jwt", token.access_token);
			if (token.access_token) {
				await setUserSession(token.access_token);
				const userSocket = io('http://localhost:3001/user', {
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
		}

		return false;
	}

	// Multi-purpose useEffect for socket handling
	useEffect(() => {
		
			globalState.userSocket?.on('friendRequest', (friendRequestDto: FriendRequestDto) => {
				toast(<FriendRequestReceived friendRequestDto={friendRequestDto}/>);
			});

			globalState.userSocket?.on('friendRequestAcceptedNotif', (data: { roomName: string, roomID: string, initiator: string, recipient: string }) => {
				const { roomName, roomID, initiator, recipient } = data;
				toast(<FriendRequestAccepted friend={recipient}/>);
				globalState.userSocket?.emit('joinRoom', {roomName: roomName, roomID: roomID});
			})

			globalState.userSocket?.on('userJoinedRoom', (notification: string) => {
			});

			globalState.userSocket?.on('userIsBan', ( data: { roomName: string, roomID: string } ) => {
				const { roomName, roomID } = data; 
				if (roomName && roomID) {
					globalState.userSocket?.emit('leaveRoom', { roomName: roomName, roomID: roomID });
					toast.warn(`You are ban from ${roomName}`);
				}
			});

			globalState.userSocket?.on('userIsUnban', ( data: { roomName: string, roomID: string } ) => {
				const { roomName, roomID } = data; 
				if (roomName && roomID) {
					globalState.userSocket?.emit('joinRoom', { roomName: roomName, roomID: roomID });
					toast.warn(`You are unban from ${roomName}`);
				}
			});

			globalState.userSocket?.on('kickUser', ( data: {roomName: string, roomID: string} ) => {
				const { roomName, roomID } = data;
				globalState.userSocket?.emit('leaveRoom', { roomName: roomName, roomID: roomID });
			});

			globalState.userSocket?.on('userAddedToRoom', (data: {convID: number, convName: string}) => {
				const { convID, convName } = data;
				globalState.userSocket?.emit('joinRoom', {roomName: convName, roomID: convID});
			});

			return () => {
				globalState.userSocket?.off('friendRequest');
				globalState.userSocket?.off('friendRequestAcceptedNotif');
				globalState.userSocket?.off('userJoinedRoom');
				globalState.userSocket?.off('userIsUnban');
				globalState.userSocket?.off('userIsBan');
				globalState.userSocket?.off('kickUser');
				globalState.userSocket?.off('userAddedToRoom');
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

			globalState.gameSocket?.emit('linkSocketWithUser', {playerLogin: sessionStorage.getItem("currentUserLogin")});
		})
		
		globalState.gameSocket?.on('disconnect', () => {
			console.log('GameSocket? disconnected from the server : ', globalState.gameSocket?.id);
		})

		globalState.gameSocket?.on('joinGame', (game: Game) => {
            console.log("JOIN GAME");
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
            globalState.gameSocket?.emit('playerJoined', {gameId: game.gameId})
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
			const response = await fetch('http://localhost:3001/auth/get2fa', {
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
		}
		catch (error) {
			console.error(error);
		}
	}
	// Login form useEffect
	useEffect(() => {
		if (code) {
			console.log('code : ', code)
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
				<ToastContainer />
					{!globalState.isConnected ?
					(<AccessComponent/>) 
					: (	
						<ChatProvider>
							<Header/>
							<BodyComponent/>
						</ChatProvider>
					)}	
			</>
			);
}
export default GeneralComponent;