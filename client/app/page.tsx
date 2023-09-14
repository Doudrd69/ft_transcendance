"use client"

import Image from 'next/image'
import React, { useState , useEffect } from 'react';
import RootLayout from './layout'
import Chat from './components/chat/Chat'
import Game from './components/game/Game'
import Header from './components/header/Header'
import styles from './globals.css'


export default function Home() {
	return (
			<RootLayout>
				<Header></Header>
				<div className="container">
					<Chat></Chat>
					<Game></Game>
				</div>
			</RootLayout>
	)
}
