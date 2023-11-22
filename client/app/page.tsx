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


export default function Home() {
	
	const socket = io('http://localhost:3001');

	const [showLogin, setShowLogin] = useState(true);
	const [show2FAForm, setShow2FAForm] = useState(false);

	const searchParams = useSearchParams();
	const code = searchParams.get('code');

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

		socket.on('connect', () => {
			console.log('Youpi une connexion!');
		})

		return () => {
			console.log('Unregistering events...');
			socket.off('connect');
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
						<Chat />
						<GameProvider>
						  <Game />
						</GameProvider>
					  </div>
					)
				}
			</RootLayout>
	)
}

// https://www.delightfulengineering.com/blog/nest-websockets/basics