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
import SettingsComponent from './components/settings/Settings';
import BodyComponent from './components/body/Body';
import SetComponent from './components/Avatar/SetAvatar';
import { totalmem } from 'os';
import GameHeader from './components/game/GameHeader';
import { useGlobal } from './GlobalContext';
import { ChatProvider } from './components/chat/ChatContext';
// import { useChat } from './components/chat/ChatContext';

interface Game {
	gameId: number;
	playerOneLogin: string,
	playerTwoLogin: string,
	playerOneID: string;
	playerTwoID: string;
	scoreOne: number;
	scoreTwo: number;
}

interface FriendRequestDto {
	recipientID: number,
	recipientLogin: string;
	initiatorLogin: string;
}

const AccessComponent = () => {

    const { globalState, dispatch } = useGlobal();
	//AccessNouspermet de nous diriger vers la bonne fenetre de connexion
	//ici on regarde si la 2fa est activé ou non
	console.log("sldkfjsdlkfjasdlkfjasdlkfja");
	return (
		<>
			{!globalState.show2FA && <Authentificationcomponent />}
			{globalState.show2FA && <TFAComponent/>}
		</>

	)
}
export default AccessComponent;