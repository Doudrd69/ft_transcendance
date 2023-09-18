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

	const handleAccessToken = async (code: any) => {
		console.log("handleAccessToken gets code: " + code);
		const response = await fetch('http://localhost:3001/auth/access', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({code}),
		});

		if (response.ok) {
			console.log("handleAccessToken successfully retreived");
		} else {
			console.error("--handleAccessoToken failed--");
		}
	}

	// const [showLogin, setShowLogin] = useState(false);

	const searchParams = useSearchParams();
	const code = searchParams.get('code');

	if (code) {
		handleAccessToken(code);
	}


	return (
			<RootLayout>
				<Header></Header>
				{/* <Authentificationcomponent></Authentificationcomponent> */}
				<div className="container">
					<Chat></Chat>
					<Game></Game>
				</div>
			</RootLayout>
	)
}
