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
	initiator: string;
	recipient: string;
}

export default function Home() {
	
	const socket = io('http://localhost:3001');
	const userSocket = io('http://localhost:3001/user')
	const gameSocket = io('http://localhost:3001/game')

	// const socket: Socket = io('http://localhost:3000');

	const [showLogin, setShowLogin] = useState(true);
	const [show2FAForm, setShow2FAForm] = useState(false);

	const searchParams = useSearchParams();
	const code = searchParams.get('code');

	const notifyFriendRequest = (recipientUsername: string) => { 
		toast.info("You received a new friend request", {
			onClose: () => console.log("Notif closed"),
			// autoClose: false,
		});
	};

	const setUserSession = async (jwt: string) => {

		const jwtArray = jwt?.split('.');
		if (jwtArray.length != 0) {
			const payload = JSON.parse(atob(jwtArray[1]));
			console.log(payload.sub);
			console.log(payload.login);
			console.log(payload.tfa_enabled);
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

	useEffect(() => {
		socket.on('friendRequest', (friendRequestDto: FriendRequestDto) => {
			if (sessionStorage.getItem("currentUserLogin") === friendRequestDto.recipient) {
				console.log("You received a friend request from ", friendRequestDto.initiator);
				notifyFriendRequest(friendRequestDto.initiator);
			}
		});

		return () => {
			socket.off('friendRequest');
		}
	}, [socket]);

	useEffect(() => {

		userSocket.on('connect', () => {
			console.log('Youpi une connexion!');
		})

		userSocket.on('disconnect', () => {
			console.log('Disconnected from the server');
		})

		socket.on('disconnect', () => {
			console.log('Disconnected from the server');
		})

		return () => {
			console.log('Unregistering events...');
			userSocket.off('connect');
			userSocket.off('disconnect');
		}
	})

	useEffect(() => {

		gameSocket.on('connect', () => {
			console.log('Youpi une connexion!');
		})

		gameSocket.on('disconnect', () => {
			console.log('Disconnected from the server');
		})

		return () => {
			console.log('Unregistering events...');
			gameSocket.off('connect');
			gameSocket.off('disconnect');
		}
	})

	useEffect(() => {
		if (code && showLogin) {
			handleAccessToken(code).then(result => {
				setShowLogin(false);
			})
		}
	}, [showLogin]);

	return (
			<RootLayout>
				<Header/>
				{showLogin ? (<Authentificationcomponent />) :
					show2FAForm ? (<TFAComponent on2FADone={handle2FADone} />) :
					(
					  <div className="container">
						<Chat socket={userSocket}/>
						<GameProvider>
						  <Game />
						</GameProvider>
					  </div>
					)
				}
			</RootLayout>
	)
}
