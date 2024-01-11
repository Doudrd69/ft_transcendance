import './BodySettings.css'
import React, { useState } from 'react';
import ProfilsSettingsComponent from './profilsSettings/ProfilsSettings';
import GlobalSettingsComponent from './globalSettings/GlobalSettings';
import GameSettingsComponent from './gameSettings/GameSettings';
import { useGlobal } from '@/app/GlobalContext';
import { Socket } from 'socket.io-client'

interface BodySettingsComponentProps {
	userSocket: Socket;
}

const BodySettingsComponent: React.FC<BodySettingsComponentProps> = ({ userSocket }) => {

	const { state, dispatch } = useGlobal();

	const renderComponent = (component: React.ReactNode, condition: boolean) =>
		condition ? component : null;
		return (
				<div className="bloc-body-settings">
					{renderComponent(<ProfilsSettingsComponent userSocket={userSocket}/>, state.showProfilsSettings)}
					{renderComponent(<GlobalSettingsComponent/>, state.showGeneralSettings)}
					{renderComponent(<GameSettingsComponent/>, state.showGameSettings)}
				</div>
			);

	};
	
	export default BodySettingsComponent;