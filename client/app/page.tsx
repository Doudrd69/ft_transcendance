"use client"

import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import React, { useState , useEffect } from 'react';
import RootLayout from './layout'
import Chat from './components/chat/Chat'
import Game from './components/game/Game'
import Header from './components/header/Header'
import Authentificationcomponent from './components/chat/auth/Authentification';

export default function Home() {
	const [showLogin, setShowLogin] = useState(true);

	const handleAccessToken = async (code: any) => {
		const response = await fetch('http://localhost:3001/auth/access', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({code}),
		});

		if (response.ok) {
			const jwt = await response.json();
			sessionStorage.setItem("jwt", JSON.stringify(jwt));
			setShowLogin(false);
		} else {
			throw new Error("Error retrieving AccessToken");
		}
	}

	const searchParams = useSearchParams();
	const code = searchParams.get('code');

	if (code && showLogin) {
		handleAccessToken(code);
	}


	return (
			<RootLayout>
				<Header></Header>
				{showLogin ? (
					<Authentificationcomponent></Authentificationcomponent>
				) : (
					<div className="container">
					<Chat></Chat>
					<Game></Game>
					</div>
				)}
			</RootLayout>
	)
}
