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
import { GlobalProvider, useGlobal } from './GlobalContext';
import SettingsComponent from './components/settings/Settings';
import BodyComponent from './components/body/Body';
import SetComponent from './components/Avatar/SetAvatar';
import { totalmem } from 'os';
import GameHeader from './components/game/GameHeader';
import GeneralComponent from './general';
import dotenv from 'dotenv';
// import { useChat } from './components/chat/ChatContext';

dotenv.config();

const test = process.env.REACT_APP_SERVER_REDIRECT_URI;

console.log(`JPPPPPP 1: ${test}`);
console.log(`JPPPPPP 2: ${process.env.REACT_APP_SERVER_REDIRECT_URI}`);
console.log(`======> ${process.env.REACT_APP_PROJECT_URL}`);

export default function Home() {

		return (
			<RootLayout>
				<GlobalProvider>
					<GeneralComponent/>
				</GlobalProvider>
			</RootLayout>
		);
}