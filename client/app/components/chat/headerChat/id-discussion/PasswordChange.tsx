import './PasswordChange.css';
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';

const PasswordChangeComponent: React.FC = () => {

	const [password, setPassword] = useState('');
	const { state, dispatch } = useChat();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newPassword = e.target.value;
		setPassword(newPassword);
	};

	const handleProtected = async(e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {

			const channelOptionDto = {
				conversationID: state.currentChannel?.id,
				userID: Number(sessionStorage.getItem("currentUserID")),
				state: state.currentChannel?.isProtected,
				password: password,
			}
			console.log("HANDLE PROTECTED: ", channelOptionDto);

			const response = await fetch(`http://localhost:3001/chat/updateIsProtectedTrue`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(channelOptionDto),
			});
	
			if (response.ok) {
				dispatch({
					type: 'SET_CURRENT_CHANNEL',
					payload: {
						...state.currentChannel,
						isProtected: true,
					},
				});
				dispatch({ type: 'ACTIVATE', payload: 'showOptionUseChannel' });
				dispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });
				dispatch({ type: 'DISABLE', payload: 'showPasswordChange' });
				
			};} 
			catch (error) {
			console.log(error);
			}
	}

	const handleClosePassword = () => {
		dispatch({ type: 'ACTIVATE', payload: 'showOptionChannel' });
		dispatch({ type: 'DISABLE', payload: 'showPasswordChange' });
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

