import './BodySettings.css'
import React, { useState } from 'react';
import ProfilsSettingsComponent from './profilsSettings/ProfilsSettings';
import GlobalSettingsComponent from './globalSettings/GlobalSettings';
import GameSettingsComponent from './gameSettings/GameSettings';
import { useGlobal } from '@/app/GlobalContext';
import { Socket } from 'socket.io-client'

const BodySettingsComponent: React.FC = () => {

	const { globalState } = useGlobal();

	const renderComponent = (component: React.ReactNode, condition: boolean) =>
		condition ? component : null;
		return (
				<div className="bloc-body-settings">
					{renderComponent(<ProfilsSettingsComponent/>, globalState.showProfilsSettings)}
					{renderComponent(<GlobalSettingsComponent/>, globalState.showGeneralSettings)}
					{renderComponent(<GameSettingsComponent/>, globalState.showGameSettings)}
				</div>
			);

	};
	
	export default BodySettingsComponent;