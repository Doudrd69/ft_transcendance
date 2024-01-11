"use client"

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
import { GlobalProvider, useGlobal } from './GlobalContext';
import SettingsComponent from './components/settings/Settings';
import BodyComponent from './components/body/Body';
import SetComponent from './components/Avatar/SetAvatar';
import { totalmem } from 'os';
import GameHeader from './components/game/GameHeader';

interface FriendRequestDto {
	recipientID: number,
	recipientLogin: string;
	initiatorLogin: string;
}

export default function Home() {

	const userSocket = io('http://localhost:3001/user', {
		autoConnect: false,	
	});

	const gameSocket = io('http://localhost:3001/game', {
		autoConnect: false,
	})

	const [showLogin, setShowLogin] = useState(true);
	const [show2FAForm, setShow2FAForm] = useState(false);
	const [authValidated, setAuthValidated] = useState(false);

	const searchParams = useSearchParams();
	const code = searchParams.get('code');

	// a voir
	if (authValidated) {
		userSocket.connect();
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
			if (userSocket.connected) {
				userSocket.emit('friendRequestAccepted', {roomName: conversationData.name, roomID: conversationData.id, initiator: friendRequestDto.initiatorLogin, recipient: friendRequestDto.recipientLogin});
				userSocket.emit('joinRoom', {roomName: conversationData.name, roomID: conversationData.id} );
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
			console.log(payload.sub);
			console.log(payload.login);
			sessionStorage.setItem("currentUserID", payload.sub);
			sessionStorage.setItem("currentUserLogin", payload.login);
			sessionStorage.setItem("2fa", payload.tfa_enabled);
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
				// Attention a la 2fa
				setAuthValidated(true);
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
		
		userSocket.on('friendRequest', (friendRequestDto: FriendRequestDto) => {
			toast(<FriendRequestReceived friendRequestDto={friendRequestDto}/>);
		});

		userSocket.on('friendRequestAcceptedNotif', (data: { roomName: string, roomID: string, initiator: string, recipient: string }) => {
			const { roomName, roomID, initiator, recipient } = data;
			toast(<FriendRequestAccepted friend={recipient}/>);
			userSocket.emit('joinRoom', {roomName: roomName, roomID: roomID});
		})

		userSocket.on('userJoinedRoom', (notification: string) => {
			console.log("User socket in main: ", userSocket.id);
			console.log("Notif from server: ", notification);
			// on peut toast ici ou gerer autrement
		});

		userSocket.on('userAddedToFriendRoom', (data: {convID: number, convName: string}) => {
			const { convID, convName } = data;
			userSocket.emit('joinRoom',  { roomName: convName, roomID: convID });
		});

		return () => {
			userSocket.off('friendRequest');
			userSocket.off('friendRequestAcceptedNotif');
			userSocket.off('userJoinedRoom');
			userSocket.off('userAddedToFriendRoom');
		}
	}, [userSocket]);

	// Connection - Deconnection useEffect
	useEffect(() => {
		
		userSocket.on('connect', () => {
			console.log("UserSocket new connection : ", userSocket.id);
			const personnalRoom = sessionStorage.getItem("currentUserLogin");
			userSocket.emit('joinPersonnalRoom', personnalRoom, sessionStorage.getItem("currentUserID"));
		})

		userSocket.on('disconnect', () => {
			console.log('UserSocket disconnected from the server : ', userSocket.id);
		})

		return () => {
			userSocket.off('connect');
			userSocket.off('disconnect');
		}

	}, [userSocket])

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
			<RootLayout>
				<GlobalProvider>
					<ToastContainer />
						{showLogin ? (
						<Authentificationcomponent />
						) : show2FAForm ? (
						<TFAComponent on2FADone={handle2FADone} />
						) : (
							<>
							{/* <SetComponent/> */}
							<Header/>
							<BodyComponent userSocket={userSocket} gameSocket={gameSocket}/>
						</>
						)}	
				</GlobalProvider>
			</RootLayout>
		  );
}
