import './Password.css';
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import { useGlobal } from '@/app/GlobalContext';

const PasswordComponent: React.FC = () => {

	const [password, setPassword] = useState('');

	const { chatState, chatDispatch } = useChat();
	const { globalState } = useGlobal();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		try {
			e.preventDefault();
			const checkPasswordDto = {
				conversationID: state.currentConversationID,
				userInput: password,
				username: sessionStorage.getItem("currentUserLogin"),
			}
		
			const response = await fetch('http://localhost:3001/chat/checkPassword', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				},
				body: JSON.stringify(checkPasswordDto),
			});
		
			if (response.ok) {
				const passwordValidated = await response.json();
				if (globalState.userSocket?.connected) {
					globalState.userSocket?.emit('refreshUserChannelList', { userToRefresh: sessionStorage.getItem("currentUserLogin") });
					globalState.userSocket?.emit('joinRoom', { roomName: state.currentConversation, roomID: state.currentConversationID });
				}
				dispatch({ type: 'DISABLE', payload: 'showPassword' });
			}
		}
		catch (error) {
			console.log(error);
		}
	}

	const handleClosePassword = () => {
		dispatch({ type: 'DISABLE', payload: 'showPassword' });
		dispatch({ type: 'ACTIVATE', payload: 'showAddChannel' });
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
			<form onSubmit={handlePasswordSubmit}>
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

export default PasswordComponent;