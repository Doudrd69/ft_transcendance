
import React, { useState , useEffect } from 'react';
import { Socket } from 'socket.io-client'
import { useSearchParams } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify';
import Authentificationcomponent from '../chat/auth/Authentification';
import TFAComponent from '../TFA/TFAComponent';
import SettingsComponent from '../settings/Settings';
import ChatComponent from '../chat/Chat';
import { GameProvider } from '../game/GameContext';
import GameComponent from '../game/Game';
import { useGlobal } from '../../GlobalContext';
import './Body.css';
import GameInviteComponent from '../chat/bodyChat/chatChannel/gameInvite';
// import { staticGenerationAsyncStorage } from 'next/dist/client/components/static-generation-async-storage.external';

const BodyComponent: React.FC = () => {
	
	const { globalState, dispatch } = useGlobal();

	const renderComponent = (component: React.ReactNode, condition: boolean) =>
	  condition ? component : null;

	return (
		<>
				<div className="container-bloc">
					{renderComponent(<SettingsComponent/>, globalState.showSettings)}
						<ChatComponent/>
						<GameComponent />
				</div>
		</>
	)
};

	export default BodyComponent;