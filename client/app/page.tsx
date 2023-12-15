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

interface FriendRequestDto {
	recipientID: number,
	recipientLogin: string;
	initiatorLogin: string;
}

export default function Home() {
	
	// const socket = io('http://localhost:3001');
	// Pour le soucis de connexion :
	// Faire join tous les sockets la meme room
	// se debrouiller pour avoir un effet useEffect(() => {}, [])
	useEffect(() => {
		const userSocket = io('http://localhost:3001/user');
	}, []);
	// const gameSocket = io('http://localhost:3001/game')

	const [showLogin, setShowLogin] = useState(true);
	const [show2FAForm, setShow2FAForm] = useState(false);

	const searchParams = useSearchParams();
	const code = searchParams.get('code');

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
		}
		else {
			console.error("Fatal error: friend request failed");
		}
	};

	const Msg = ({ closeToast, toastProps, friendRequestDto }: any) => (
		<div>
		  You received a friend request from  {friendRequestDto.initiatorLogin}
		  <button style={{ padding: '10px '}} onClick={() => friendRequestValidation(friendRequestDto)}>Accept</button>
		  <button onClick={closeToast}>Deny</button>
		</div>
	)

	const notifyFriendRequest = (friendRequestDto: FriendRequestDto) => { 
		toast(<Msg friendRequestDto={friendRequestDto}/>);
	};

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
			// emit vers addRoom pour creer une room avec le login du user
			// if (userSocket.connected) {
			// 	userSocket.emit('joinRoom', {roomName: sessionStorage.getItem("currentUserLogin"), userID: userSocket.id});
			// }
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

				console.log("-- Fetch to API successed --");
				const token = await response.json();
				sessionStorage.setItem("jwt", token.access_token);
				const jwt = sessionStorage.getItem("jwt");
				if (jwt)
					await setUserSession(jwt);
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

	// useEffect(() => {

	// 	userSocket.on('roomMessage', (message: string) => {
	// 		console.log(message);
	// 	});
		
	// 	userSocket.on('friendRequest', (friendRequestDto: FriendRequestDto) => {
	// 		// mouais a revoir avec un to.emit dans le gateway
	// 		if (sessionStorage.getItem("currentUserLogin") === friendRequestDto.recipientLogin) {
	// 			notifyFriendRequest(friendRequestDto);
	// 		}
	// 	});

	// 	return () => {
	// 		userSocket.off('friendRequest');
	// 		userSocket.off('roomMessage');
	// 	}
	// }, [userSocket]);

	// Connection - Deconnection useEffect for socket
	// useEffect(() => {

		// userSocket.on('connect', () => {
		// 	if (userSocket.connected)
		// 		console.log("UserSocket new connection : ", userSocket.id);
		// })

		// userSocket.on('disconnect', () => {
		// 	console.log('UserSocket disconnected from the server : ', userSocket.id);
		// })

		// return () => {
			// console.log('Unregistering events...');
			// userSocket.off('connect');
			// userSocket.off('disconnect');
		// }
	// })

	// Game socket handler
	// useEffect(() => {

	// 	gameSocket.on('connect', () => {
	// 		console.log('GameSocket new connection : ', gameSocket.id);
	// 	})

	// 	gameSocket.on('disconnect', () => {
	// 		console.log('GameSocket disconnected from the server : ', gameSocket.id);
	// 	})

	// 	return () => {
	// 		console.log('Unregistering events...');
	// 		gameSocket.off('connect');
	// 		gameSocket.off('disconnect');
	// 	}
	// })

	// Login form use-effect
	// useEffect(() => {
	// 	if (code && showLogin) {
	// 		handleAccessToken(code).then(result => {
	// 			setShowLogin(false);
	// 		})
	// 	}
	// }, [showLogin]);

	// Testing purpose
	useEffect(() => {
		if (sessionStorage.getItem("currentUserLogin") != null)
			setShowLogin(false);
	});

	return (
			<RootLayout>
				<Header/>
				{showLogin ? (<Authentificationcomponent />) :
					// show2FAForm ? (<TFAComponent on2FADone={handle2FADone} />) :
					// (
						<div className="container">
							<ToastContainer />
							<Chat socket={userSocket}/>
							<GameProvider>
								<Game />
							</GameProvider>
						</div>
					// )
				}
			</RootLayout>
	)
}

// https://www.delightfulengineering.com/blog/nest-websockets/basics