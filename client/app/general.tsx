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

    const { state, dispatch } = useGlobal();

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
			console.log("convData: ", conversationData);
			if (state.userSocket) {
				state.userSocket.emit('friendRequestAccepted', {roomName: conversationData.name, roomID: conversationData.id, initiator: friendRequestDto.initiatorLogin, recipient: friendRequestDto.recipientLogin});
				state.userSocket.emit('joinRoom', {roomName: conversationData.name, roomID: conversationData.id} );
			}
		}
		else {
			console.error("Fatal error: friend request failed");
		}
	};

	const FriendRequestReceived = ({ closeToast, toastProps, friendRequestDto }: any) => (
		<div>
		  You received a friend request from  {friendRequestDto.initiatorLogin}
		  <button style={{ padding: '5px '}} onClick={() => friendRequestValidation(friendRequestDto)}>Accept</button>
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
			console.log("Username: ", payload.username);
			if (payload.username === payload.login)
				sessionStorage.setItem("currentUserLogin", payload.login);
			else
				sessionStorage.setItem("currentUserLogin", payload.username);
			if (payload.tfa_enabled) {
				setShow2FAForm(true);
			}
		}
	}

	const handleAccessToken = async (code: any): Promise<boolean> => {

		if (sessionStorage.getItem("jwt")) {
			setAuthValidated(true);
			return true;
		}

		const response = await fetch('http://localhost:3001/auth/access', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({code}),
		});

		if (response.ok) {

			console.log("-- Access granted --");
			const token = await response.json();
			sessionStorage.setItem("jwt", token.access_token);
			const jwt = sessionStorage.getItem("jwt");
			if (jwt) {
				await setUserSession(jwt);
				setAuthValidated(true);
                const userSocket = io('http://localhost:3001/user', {
	            	auth: {
	            		token: jwt,
	            	}
	            });
                dispatch({ type: 'SET_SOCKET', payload: userSocket });
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
		
		if (state.userSocket) {
			console.log(state.userSocket);
			state.userSocket.on('friendRequest', (friendRequestDto: FriendRequestDto) => {
				toast(<FriendRequestReceived friendRequestDto={friendRequestDto}/>);
			});
	
			state.userSocket.on('friendRequestAcceptedNotif', (data: { roomName: string, roomID: string, initiator: string, recipient: string }) => {
				const { roomName, roomID, initiator, recipient } = data;
				toast(<FriendRequestAccepted friend={recipient}/>);
				state.userSocket.emit('joinRoom', {roomName: roomName, roomID: roomID});
			})
	
			state.userSocket.on('userJoinedRoom', (notification: string) => {
				console.log("User socket in main: ", state.userSocket.id);
				console.log("Notif from server: ", notification);
				// on peut toast ici ou gerer autrement
			});
	
			state.userSocket.on('userAddedToFriendRoom', (data: {convID: number, convName: string}) => {
				const { convID, convName } = data;
				state.userSocket.emit('joinRoom',  { roomName: convName, roomID: convID });
			});
	
			state.userSocket.on('userIsBan', ( data: { roomName: string, roomID: string } ) => {
				const { roomName, roomID } = data; 
				if (roomName && roomID) {
					// dispatch({ type: 'DISABLE', payload: 'showChannel' });
					state.userSocket.emit('leaveRoom', { roomName: roomName, roomID: roomID });
					toast.warn(`You are ban from ${roomName}`);
				}
			});
	
			state.userSocket.on('userIsUnban', ( data: { roomName: string, roomID: string } ) => {
				const { roomName, roomID } = data; 
				if (roomName && roomID) {
					state.userSocket.emit('joinRoom', { roomName: roomName, roomID: roomID });
					toast.warn(`You are unban from ${roomName}`);
				}
			});
	
			return () => {
				state.userSocket.off('friendRequest');
				state.userSocket.off('friendRequestAcceptedNotif');
				state.userSocket.off('userJoinedRoom');
				state.userSocket.off('userAddedToFriendRoom');
				state.userSocket.off('userIsUnban');
				state.userSocket.off('userIsBan');
			}
		}

	}, [state.userSocket]);

	// Connection - Deconnection useEffect
	useEffect(() => {
		
		if (state.userSocket) {
			state.userSocket.on('connect', () => {
				console.log("UserSocket new connection : ", state.userSocket.id);
				const personnalRoom = sessionStorage.getItem("currentUserLogin");
				state.userSocket.emit('joinPersonnalRoom', personnalRoom, sessionStorage.getItem("currentUserID"));
			})
			
			state.userSocket.on('disconnect', () => {
				console.log('UserSocket disconnected from the server : ', state.userSocket.id);
			})
	
			state.userSocket.on('newConnection', (notif: string) => {
				toast(notif);
			})
	
			state.userSocket.on('newDeconnection', (notif: string) => {
				toast(notif);
			})
	
			return () => {
				state.userSocket.off('connect');
				state.userSocket.off('disconnect');
				state.userSocket.off('newConnection');
				state.userSocket.off('newDeconnection');
			}
		}

	}, [state.userSocket])

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
                        <BodyComponent userSocket={state.userSocket} gameSocket={gameSocket}/>
                    </>
                    )}	
            </>      
		  );
}
export default GeneralComponent;