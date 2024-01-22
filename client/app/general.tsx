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
// import { useChat } from './components/chat/ChatContext';

interface FriendRequestDto {
	recipientID: number,
	recipientLogin: string;
	initiatorLogin: string;
}

const GeneralComponent = () => {

    const { globalState, dispatch } = useGlobal();

	// faire comme le usersocket
	const gameSocket = io('http://localhost:3001/game', {
		autoConnect: false,
	})

	const [showLogin, setShowLogin] = useState(true);
	const [show2FAForm, setShow2FAForm] = useState(false);
	const [authValidated, setAuthValidated] = useState(false);

	const searchParams = useSearchParams();
	const code = searchParams.get('code');

	if (authValidated) {
		gameSocket.connect();
	}

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
				closeToast
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
			if (payload.tfa_enabled) {
				setShow2FAForm(true);
			}
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

		if (userReconnects())
			return true;

		const response = await fetch('http://localhost:3001/auth/access', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({code}),
		});

		if (response.ok) {

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
				setAuthValidated(true);
				// Attention a la 2fa
				return true;
			}
			else
				return false;
		}

		return false;
	}

	const handle2FADone = () => {
		setShow2FAForm(false);
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
				console.log("User socket in main: ", globalState.userSocket?.id);
				console.log("Notif from server: ", notification);
				// on peut toast ici ou gerer autrement
			});
	
			globalState.userSocket?.on('userAddedToFriendRoom', (data: {convID: number, convName: string}) => {
				const { convID, convName } = data;
				globalState.userSocket?.emit('joinRoom',  { roomName: convName, roomID: convID });
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
	
			return () => {
				globalState.userSocket?.off('friendRequest');
				globalState.userSocket?.off('friendRequestAcceptedNotif');
				globalState.userSocket?.off('userJoinedRoom');
				globalState.userSocket?.off('userAddedToFriendRoom');
				globalState.userSocket?.off('userIsUnban');
				globalState.userSocket?.off('userIsBan');
		}

	}, [globalState?.userSocket]);

	// Connection - Deconnection useEffect
	useEffect(() => {
		
			// Works on both connection and reconnection
			globalState.userSocket?.on('connect', () => {
				console.log("UserSocket new connection : ", globalState.userSocket?.id);
				const personnalRoom = sessionStorage.getItem("currentUserLogin");
				globalState.userSocket?.emit('joinPersonnalRoom', personnalRoom, sessionStorage.getItem("currentUserID"));
			})
			
			globalState.userSocket?.on('disconnect', () => {
				console.log('UserSocket disconnected from the server : ', globalState.userSocket?.id);
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

		gameSocket.on('connect', () => {
			console.log('GameSocket new connection : ', gameSocket.id);
			gameSocket.emit('linkSocketWithUser', sessionStorage.getItem("currentUserLogin"));
		})

		gameSocket.on('disconnect', () => {
			console.log('GameSocket disconnected from the server : ', gameSocket.id);
		})

		return () => {
			console.log('Unregistering events...');
			gameSocket.off('connect');
			gameSocket.off('disconnect');
		}
	}, [gameSocket])

	// Login form useEffect
	useEffect(() => {
		if (code && showLogin) {
			handleAccessToken(code).then(result => {
				setShowLogin(false);
			})
		}
	}, [showLogin]);

	// For testing purpose : no 42 form on connection
	// useEffect(() => {
	// 	if (sessionStorage.getItem("currentUserLogin") != null)
	// 		setShowLogin(false);
	// });
	
		return (
            <>
                <ToastContainer />
                    {showLogin ? (
                    <Authentificationcomponent />
                    ) : show2FAForm ? (
                    <TFAComponent on2FADone={handle2FADone} />
                    ) : (
                        <>
                        {/* <SetComponent/> */}
                        <Header/>
                        <BodyComponent gameSocket={gameSocket}/>
                    </>
                    )}	
            </>      
		  );
}
export default GeneralComponent;