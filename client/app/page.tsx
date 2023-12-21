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
			},
			body: JSON.stringify(friendRequestDto),
		});

		if (response.ok) {
			console.log("User added to your friend list!");
			const roomName = friendRequestDto.initiatorLogin + friendRequestDto.recipientLogin;
			if (userSocket.connected) {
				userSocket.emit('friendRequestAccepted', friendRequestDto);
				userSocket.emit('joinRoom', roomName);
			}
		}
		else {
			console.error("Fatal error: friend request failed");
		}
	};

	const FriendRequestReceived = ({ closeToast, toastProps, friendRequestDto }: any) => (
		<div>
		  You received a friend request from  {friendRequestDto.initiatorLogin}
		  <button style={{ padding: '10px '}} onClick={() => friendRequestValidation(friendRequestDto)}>Accept</button>
		  <button onClick={closeToast}>Deny</button>
		</div>
	)

	const FriendRequestAccepted = ({ closeToast, toastProps, friendRequestDto }: any) => (
		<div>
		  {friendRequestDto.recipientLogin} has accepted your friend request!
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
			if (payload.tfa_enabled) {
				setShow2FAForm(true);
			}
		}
	}

	const handleAccessToken = async (code: any): Promise<boolean> => {

		try {
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
				}
				return true;
			}
			else {
				return false;
			}
			} catch (error) {
			throw error;
		}
	}

	const handle2FADone = () => {
		setShow2FAForm(false);
	}

	// Multi-purpose useEffect for socket handling
	useEffect(() => {
		
		userSocket.on('friendRequest', (friendRequestDto: FriendRequestDto) => {
			toast(<FriendRequestReceived friendRequestDto={friendRequestDto}/>);
		});

		userSocket.on('friendRequestAcceptedNotif', (friendRequestDto: FriendRequestDto) => {
			toast(<FriendRequestAccepted friendRequestDto={friendRequestDto}/>);
			const roomName = friendRequestDto.initiatorLogin + friendRequestDto.recipientLogin;
			userSocket.emit('joinRoom', roomName);
		})

		// userSocket.on('userJoinedRoom', (notification: string) => {
		// 	console.log("User socket in main: ", userSocket.id);
		// 	console.log("Notif from server: ", notification);
		// });

		return () => {
			userSocket.off('friendRequest');
			userSocket.off('friendRequestAcceptedNotif');
		}
	}, [userSocket]);

	// Connection - Deconnection useEffect for socket
	useEffect(() => {

		userSocket.on('connect', () => {
			const personnalRoom = sessionStorage.getItem("currentUserLogin");
			console.log("UserSocket new connection : ", userSocket.id);
			userSocket.emit('joinPersonnalRoom', personnalRoom, sessionStorage.getItem("currentUserID"));
			userSocket.emit('rejoinRooms', sessionStorage.getItem("currentUserID"));
		})

		userSocket.on('disconnect', () => {
			const personnalRoom = sessionStorage.getItem("currentUserLogin");
			console.log('UserSocket disconnected from the server : ', userSocket.id);
			userSocket.emit('leavePersonnalRoom', personnalRoom, sessionStorage.getItem("currentUserID"));
			userSocket.emit('leaveRooms', sessionStorage.getItem("currentUserID"));
		})

		return () => {
			console.log('Unregistering events...');
			userSocket.off('connect');
			userSocket.off('disconnect');
		}
	}, [userSocket])

	// Game socket handler
	useEffect(() => {

		gameSocket.on('connect', () => {
			console.log('GameSocket new connection : ', gameSocket.id);
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

	// Login form use-effect
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
				<Header/>
				{showLogin ? (<Authentificationcomponent />) :
					show2FAForm ? (<TFAComponent on2FADone={handle2FADone} />) :
					(
					  <div className="container">
						<ToastContainer />
						<Chat socket={userSocket}/>
						<GameHeader socket={gameSocket}/>
					  </div>
					)
				}
			</RootLayout>
	)
}
