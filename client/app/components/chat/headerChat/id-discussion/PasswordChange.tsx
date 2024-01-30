import './PasswordChange.css';
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import { useGlobal } from '@/app/GlobalContext';

const PasswordChangeComponent: React.FC = () => {

	const [password, setPassword] = useState('');
	const { chatState, chatDispatch } = useChat();
	const { globalState } = useGlobal();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newPassword = e.target.value;
		setPassword(newPassword);
	};

	const handleProtected = async(e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {

			const channelOptionDto = {
				conversationID: Number(chatState.currentConversationID),
				userID: Number(sessionStorage.getItem("currentUserID")),
				state: chatState.currentConversationIsProtected,
				password: password,
			}

			const response = await fetch(`${process.env.API_URL}/chat/updateIsProtectedTrue`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(channelOptionDto),
			});
	
			if (response.ok) {
				console.log("isProtectedTrue");
				globalState.userSocket?.emit('refreshChannelList', {
					roomName : chatState.currentConversation,
					roomID: chatState.currentConversationID,
				});
				chatDispatch({ type: 'ACTIVATE', payload: 'currentConversationIsProtected' });
				chatDispatch({ type: 'ACTIVATE', payload: 'showOptionUseChannel' });
				chatDispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });
				chatDispatch({ type: 'DISABLE', payload: 'showPasswordChange' });
			};} 
			catch (error) {
				console.log(error);
			}
	}

	const handleClosePassword = () => {
		chatDispatch({ type: 'ACTIVATE', payload: 'showOptionChannel' });
		chatDispatch({ type: 'DISABLE', payload: 'showPasswordChange' });
	};

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
					handleClosePassword();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, []);

	return (
		<div className='blur-background-password'>
		<img className="add_button_cancel" src='./close.png'  onClick={handleClosePassword}/>
			<div className="password-form">
			<p className="text-password">ENTER THE PASSWORD</p>
			<form onSubmit={handleProtected}>
				<input
				type="password"
				name="password"
				placeholder="Entrez le mot de passe"
				value={password}
				onChange={handleChange}
				/>
				<button type="submit">OK</button>
			</form>
			</div>

		</div>
	);
};

export default PasswordChangeComponent;

