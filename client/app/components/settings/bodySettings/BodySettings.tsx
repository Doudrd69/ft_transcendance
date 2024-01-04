import './BodySettings.css'
import React, { useState } from 'react';
import ProfilsSettingsComponent from './profilsSettings/ProfilsSettings';
import GlobalSettingsComponent from './globalSettings/GlobalSettings';
import GameSettingsComponent from './gameSettings/GameSettings';
import { useGlobal } from '@/app/GlobalContext';

const BodySettingsComponent: React.FC = () => {

	const { state, dispatch } = useGlobal();

	const handleCloseSettings = () => {
		dispatch({ type: 'DISABLE' , payload: 'showSettings' });
		dispatch({ type: 'DISABLE', payload: 'showGeneralSettings'});
		dispatch({ type: 'DISABLE', payload: 'showProfilsSettings'});
		dispatch({ type: 'DISABLE', payload: 'showGameSettings'});
	};
	const renderComponent = (component: React.ReactNode, condition: boolean) =>
		condition ? component : null;
		return (
				<div className="bloc-body-settings">
					 <div className="close-settings" onClick={handleCloseSettings}>
						&#10006;
					</div>
					{renderComponent(<ProfilsSettingsComponent/>, state.showProfilsSettings)}
					{renderComponent(<GlobalSettingsComponent/>, state.showGeneralSettings)}
					{renderComponent(<GameSettingsComponent/>, state.showGameSettings)}
				</div>
			);

	};
	
	export default BodySettingsComponent;