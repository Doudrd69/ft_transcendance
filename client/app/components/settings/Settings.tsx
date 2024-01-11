import './Settings.css'
import React, { useState, useEffect } from 'react';
import HeaderSettingsComponent from './headerSettings/HearderSettings';
import BodySettingsComponent from './bodySettings/BodySettings';
import { useGlobal } from '@/app/GlobalContext';
import { Socket } from 'socket.io-client'

interface SettingsComponentProps {
	userSocket: Socket;
}

const SettingsComponent: React.FC<SettingsComponentProps> = ({ userSocket }) => {
	const {dispatch} = useGlobal();

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				handleCloseSettings();
			}
		};
		
			document.addEventListener('keydown', handleEscape);
			return () => {
			  document.removeEventListener('keydown', handleEscape);
			};
		  }, []);

	const handleCloseSettings = () => {
		dispatch({ type: 'DISABLE' , payload: 'showSettings' });
		dispatch({ type: 'DISABLE', payload: 'showGeneralSettings'});
		dispatch({ type: 'DISABLE', payload: 'showProfilsSettings'});
		dispatch({ type: 'DISABLE', payload: 'showGameSettings'});
	};
	return (
		<div className="back-settings">
			<img className="add_button_cancel" src='./close.png'  onClick={handleCloseSettings}/>
			<div className="window-settings">
				<HeaderSettingsComponent></HeaderSettingsComponent>
				<BodySettingsComponent userSocket={userSocket}></BodySettingsComponent>
			</div>
		</div>
	);

};	
export default SettingsComponent;