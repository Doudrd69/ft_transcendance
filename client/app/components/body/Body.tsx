
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

interface BodyComponentProps {
	userSocket: Socket;
	gameSocket: Socket;
}

const BodyComponent: React.FC<BodyComponentProps> = ({ userSocket, gameSocket }) => {
	
	const { state, dispatch } = useGlobal();

	const renderComponent = (component: React.ReactNode, condition: boolean) =>
	  condition ? component : null;

	return (
		<>
				<div className="container">
					{renderComponent(<SettingsComponent/>, state.showSettings)}
						<ChatComponent socket={userSocket}/>
						<GameProvider>
							<GameComponent socket={gameSocket}/>
						</GameProvider>
				</div>
		</>
	)
};

	export default BodyComponent;