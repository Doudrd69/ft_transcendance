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
	const searchParams = useSearchParams();
	const code = searchParams.get('code');

	const handleAccessToken = async (code: any): Promise<boolean> => {

		if (showLogin)
			return true;

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
				return true;
			}
			else {
				throw new Error("Authentification failed");
			}
		} catch (error) {
			throw error;
		}
	}
	
	useEffect(() => {
		if (code && showLogin) {
		  handleAccessToken(code)
			.then(result => {;
			  setShowLogin(false);
			})
			.catch(error => {
			  setShowLogin(true);
			  console.error(error);
			});
		}
	  }, [code, showLogin]);

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
