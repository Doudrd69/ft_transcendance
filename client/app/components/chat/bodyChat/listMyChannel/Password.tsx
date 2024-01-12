import './Password.css';
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';

interface PasswordComponentProps {
userSocket: Socket;
}

const PasswordComponent: React.FC<PasswordComponentProps> = ({ userSocket }) => {
	const [password, setPassword] = useState('');

	const { state, dispatch } = useChat();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (state.currentConversationID != null && state.currentFriend != null) {
		await addFriendToConversation(state.currentConversationID, state.currentFriend, password);
		}
	};

	const addFriendToConversation = async (convID: number, friend: string, password: string) => {
		const addFriendToConversationDto = {
		userToAdd: friend,
		conversationID: convID,
		};

		console.log(addFriendToConversationDto);

		const response = await fetch('http://localhost:3001/chat/addFriendToConversation', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
		},
		body: JSON.stringify(addFriendToConversationDto),
		});

		if (response.ok) {
		const conversation = await response.json();
		if (userSocket.connected) {
			userSocket.emit('addUserToRoom', { convID: conversation.id || null, convName: conversation.name, friend: friend });
		}
		console.log("Friend has been successfully added!");
		dispatch({ type: 'TOGGLE', payload: 'listChannelAdd' });
		} else {
		console.log("Fatal error");
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

