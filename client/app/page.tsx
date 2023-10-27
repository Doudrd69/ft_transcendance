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


export default function Home() {

	const [showLogin, setShowLogin] = useState(true);
	const [show2FAForm, setShow2FAForm] = useState(false);
	const searchParams = useSearchParams();
	const code = searchParams.get('code');

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
				if (jwt) {
					const jwtArray = jwt?.split('.');
					if (jwtArray.length != 0) {
						const payload = JSON.parse(atob(jwtArray[1]));
						console.log(payload.sub);
						console.log(payload.login);
						console.log(payload.tfa_enabled);
						if (payload.tfa_enabled) {
							setShow2FAForm(true);
						}
					}
				}
				return true;
			}
			else {
				throw new Error("Authentification failed");
			}
		} catch (error) {
			throw error;
		}
	}

	//Runs on the first render
	//And any time any dependency value changes
	useEffect(() => {
		if (code && showLogin) {
			handleAccessToken(code).then(result => {
				setShowLogin(false);
			}).catch(error => {
				setShowLogin(true);
				console.error(error);
			});
		}
	}, [code, showLogin]);

	return (
			<RootLayout>
				<Header/>
				{showLogin ? (<Authentificationcomponent />) :
					show2FAForm ? (<TFAComponent />) :
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
