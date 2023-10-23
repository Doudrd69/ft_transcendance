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

	const [showLogin, setShowLogin] = useState(true);

	const handleAccessToken = async (code: any) => {

		if (sessionStorage.getItem("jwt")) {
			// setShowLogin(false); CAUSING HYDRATION
			console.log("User is already logged");
			return ;
		}

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
				setShowLogin(false);
				return ;
			}
			throw new Error("Authentification failed");
		} catch (error) {
			console.error(error);
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
