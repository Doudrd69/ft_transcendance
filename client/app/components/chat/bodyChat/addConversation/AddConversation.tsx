	import React, { useState } from 'react';
	import { Socket } from 'socket.io-client';
	import { useChat } from '../../ChatContext';
	import './AddConversation.css';

	interface AddConversationComponentProps {
		socket: Socket;
		updateConversations: () => void;
		title: string;
		isChannel: boolean;
	}

	const AddConversationComponent: React.FC<AddConversationComponentProps> = ({ socket, updateConversations, title, isChannel }) => {
	const [formValue, setFormValue] = useState('');
	const { state, dispatch } = useChat();

	const handleConversationCreation = async (e: React.FormEvent) => {
		e.preventDefault();

		// Vérifier que isChannel est défini
		if (typeof isChannel === 'boolean') {
		const conversationDto = {
			name: formValue,
			username: sessionStorage.getItem("currentUserLogin"),
			is_channel: isChannel,
		};

		const response = await fetch('http://localhost:3001/chat/newConversation', {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json',
			},
			body: JSON.stringify(conversationDto),
		});

		if (response.ok) {
			console.log("Conversation successfully created");
			dispatch({ type: 'DISABLE', payload: 'showAddChannel' });
			dispatch({ type: 'DISABLE', payload: 'showAddUser' });
			dispatch({ type: 'DISABLE', payload: 'showAddFriend' });
			updateConversations(); // Appeler la fonction de mise à jour
		} else {
			console.log("Conversation creation failed");
		}
			setFormValue('');
		} else {
		console.error("isChannel is not defined or not a boolean");
		}
	};

	const handleCancel = () => {
		dispatch({ type: 'DISABLE', payload: 'showAddChannel' });
		dispatch({ type: 'DISABLE', payload: 'showAddUser' });
		dispatch({ type: 'DISABLE', payload: 'showAddFriend' });
		setFormValue('');
	};

	return (
		<>
		<div className="blur-background"></div>
		<div className="bloc-add-conversation">
			<div className="add__header">
			<h2 className="add__title">{title}</h2>
			</div>
			<div className="add__body">
			<form className="add__form" onSubmit={(e) => handleConversationCreation(e)}>
				<input
				className="add__input"
				type="text"
				placeholder="Conversation name"
				value={formValue}
				onChange={(e) => setFormValue(e.target.value)}
				/>
				<div className="add__buttons">
				<button className="add__button" type="submit">
					Create
				</button>
				<button className="add_button_cancel" type="button" onClick={handleCancel}>
					Cancel
				</button>
				</div>
			</form>
			</div>
		</div>
		</>
	);
	};

	export default AddConversationComponent;
