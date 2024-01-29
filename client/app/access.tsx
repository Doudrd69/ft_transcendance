import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useGlobal } from './GlobalContext';
import TFAComponent from './components/TFA/TFAComponent';
import Authentificationcomponent from './components/chat/auth/Authentification';
import Game from './components/game/Game';
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
	//Access nous permet de nous diriger vers la bonne fenetre de connexion
	//ici on regarde si la 2fa est activé ou non
	return (
		<>
			{!globalState.show2FA && <Authentificationcomponent />}
			{globalState.show2FA && <TFAComponent/>}
		</>

	)
}
export default AccessComponent;