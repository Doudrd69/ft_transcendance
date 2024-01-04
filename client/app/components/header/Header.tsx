import { useGlobal } from '@/app/GlobalContext';
import './Header.css'
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AvatarImageComponent from '../Avatar/Avatar';


const HeaderComponent: React.FC = () => {
	const { state, dispatch } = useGlobal();
	const notify = (flag: number) => { 
	switch (flag) {
		case 0:
		return ;
		case 1:
		toast.success("Username has been updated");
		return ;
		case 2:
		toast("Authenticator code is verified");
	}
	};
	return (
	<div className="header">
		<div className="bloc-profils">
		<button className="button-profils"
			onClick={() => {
			if (!state.showSettings) {
				dispatch({ type: 'TOGGLEX', payload: 'showSettings' });
				dispatch({ type: 'ACTIVATE', payload: 'showProfilsSettings'});

				console.log(state);
			} 
			else {
				dispatch({ type: 'DISABLE', payload: 'showSettings' });
				dispatch({ type: 'DISABLE', payload: 'showGeneralSettings'});
				dispatch({ type: 'DISABLE', payload: 'showProfilsSettings'});
				dispatch({ type: 'DISABLE', payload: 'showGameSettings'});
			}}}>
			<AvatarImageComponent className="profils"/>
		</button>
		</div>

		<div className="bloc-pong">PONG&CHAT</div>
		<div className="bloc-settings">
		<button
			className="button-settings"
			onClick={() => {
			
			if (!state.showSettings) {
				dispatch({ type: 'TOGGLEX', payload: 'showSettings' });
				dispatch({ type: 'ACTIVATE', payload: 'showGeneralSettings'});
			} else {
				dispatch({ type: 'DISABLE', payload: 'showSettings' });
				dispatch({ type: 'DISABLE', payload: 'showGeneralSettings'});
				dispatch({ type: 'DISABLE', payload: 'showProfilsSettings'});
				dispatch({ type: 'DISABLE', payload: 'showGameSettings'});
			}
			}}>
			<img className="settings" src='./settings.png' alt="Settings" />
		</button>
		</div>
	</div>
	);
};

export default HeaderComponent;
