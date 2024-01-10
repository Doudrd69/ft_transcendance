import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import './AddConversation.css';

interface AddConversationComponentProps {
	userSocket: Socket;
	loadDiscussions: () => void;
	title: string;
	isChannel: boolean;
}

const AddConversationComponent: React.FC<AddConversationComponentProps> = ({ userSocket, loadDiscussions, title, isChannel}) => {

	const [formValue, setFormValue] = useState('');
	// const [passwordValue, setPasswordValue] = useState('');
	// const [isPublicValue, setIsPublicValue] = useState(true);
	// const [channelPassword, setChannelPassword] = useState('');
	const { state, dispatch } = useChat();
	const [isPublic, setIsPublic] = useState(true);
  
	const handleConversationCreation = async (e: React.FormEvent) => {

		e.preventDefault();

		const conversationDto = {
			name: formValue,
			userID: Number(sessionStorage.getItem("currentUserID")),
			is_channel: isChannel,
			isPublic: isPublic,
			// password: '',
		}

		console.log(conversationDto);

		const response = await fetch('http://localhost:3001/chat/newConversation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
			},
			body: JSON.stringify(conversationDto),
		});

		if (response.ok) {

			const data = await response.json();

			if (userSocket.connected) {
				userSocket.emit('joinRoom', { roomName: data.name, roomID: data.id }, () => {
					console.log("Room creation loading...");
				});
			}

			console.log("Conversation successfully created");
			dispatch({ type: 'DISABLE', payload: 'showAddChannel' });
			dispatch({ type: 'DISABLE', payload: 'showAddUser' });
			dispatch({ type: 'DISABLE', payload: 'showAddFriend' });
			dispatch({ type: 'TOGGLEX', payload: 'refreshChannel'});
		} else {
			const error = await response.json();
			console.log("Error: ", error.message);
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
