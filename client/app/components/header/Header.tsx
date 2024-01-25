import { useGlobal } from '@/app/GlobalContext';
import './Header.css'
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AvatarImageComponent from '../Avatar/Avatar';
import { validate, validateOrReject } from 'class-validator';
import { useChat } from '../chat/ChatContext';


const HeaderComponent: React.FC = () => {
	const {chatDispatch} = useChat();
	const { globalState, dispatch } = useGlobal();
	const uploadAvatar =  () => {
		dispatch({ type: 'ACTIVATE', payload: 'showUploadAvatar' });
	}

	useEffect(() => {
		uploadAvatar();
	}, [globalState.showRefresh]);

	const renderComponent = (component: React.ReactNode, condition: boolean) =>
		condition ? component : null;

	return (
		<div className="header">
			<div className="bloc-profils">
				<button className="button-profils"
					onClick={() => {
					if (!globalState.showSettings) {
						dispatch({ type: 'TOGGLEX', payload: 'showSettings' });
						dispatch({ type: 'ACTIVATE', payload: 'showProfilsSettings'});
						chatDispatch({ type: 'DISABLE', payload: 'showBackComponent' });
					} 
					else {
						dispatch({ type: 'DISABLE', payload: 'showSettings' });
						dispatch({ type: 'DISABLE', payload: 'showGeneralSettings'});
						dispatch({ type: 'DISABLE', payload: 'showProfilsSettings'});
						dispatch({ type: 'DISABLE', payload: 'showGameSettings'});
						chatDispatch({ type: 'DISABLE', payload: 'showBackComponent' });

					}}}>
					{renderComponent(<AvatarImageComponent className="profils" refresh={globalState.showRefresh}/>, globalState.showUploadAvatar)}
				</button>
			</div>
		<div className="bloc-pong">PONG&CHAT</div>
		<div className="bloc-settings">
			<button
				className="button-settings"
				onClick={() => {
				if (!globalState.showSettings) {
					dispatch({ type: 'TOGGLEX', payload: 'showSettings' });
					dispatch({ type: 'ACTIVATE', payload: 'showGeneralSettings'});
					dispatch({ type: 'DISABLE', payload: 'showBackComponent' });
				} else {
					dispatch({ type: 'DISABLE', payload: 'showSettings' });
					dispatch({ type: 'DISABLE', payload: 'showGeneralSettings'});
					dispatch({ type: 'DISABLE', payload: 'showProfilsSettings'});
					dispatch({ type: 'DISABLE', payload: 'showGameSettings'});
					dispatch({ type: 'DISABLE', payload: 'showBackComponent' });

				}
			}}>
				<img className="settings" src='./settings.png' alt="Settings" />
			</button>
		</div>
	</div>
	);
};

export default HeaderComponent;
