"use client"

import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import React, { useState , useEffect } from 'react';
import RootLayout from './layout'
import Chat from './components/chat/Chat'
import Game from './components/game/Game'
import Header from './components/header/Header'
import Authentificationcomponent from './components/chat/auth/Authentification';
import { GameProvider } from './components/game/GameContext';


export default function Home() {

	const [showLogin, setShowLogin] = useState(false);

	const handleAccessToken = async (code: any) => {

		try {
			const response = await fetch('http://localhost:3001/auth/access', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({code}),
			});

			console.log("Request to API done, now logging...");

			if (response.ok) {
				console.log("-- Fetch to API successed --");
				const token = await response.json();
				sessionStorage.setItem("jwt", token.access_token);
				setShowLogin(false);
				return true;
			}
			throw new Error("Cannot retrieve data from response");
		} catch (error) {
			console.error("Fetch to API failed: ", error);
		}
	}

	const searchParams = useSearchParams();
	const code = searchParams.get('code');

	if (code && showLogin) {
		handleAccessToken(code);
	}

	return (
			<RootLayout>
				<Header/>
				{showLogin ? (<Authentificationcomponent/>) : 
				(
				<div className="container">
					<Chat/>
					<GameProvider>
						<Game/>
					</GameProvider>
				</div>
				)}
			</RootLayout>
	)
}
