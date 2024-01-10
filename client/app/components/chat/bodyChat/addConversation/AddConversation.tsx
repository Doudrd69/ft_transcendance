import React, { useState, useEffect } from 'react';
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
	const [passwordValue, setPasswordValue] = useState('');
	const { state, dispatch } = useChat();
	const [isPassword, setIsPassowrd] = useState(false);
	const [isPublic, setIsPublic] = useState(true);
	const handleConversationCreation = async (e: React.FormEvent) => {

		e.preventDefault();

		const conversationDto = {
			name: formValue,
			userID: Number(sessionStorage.getItem("currentUserID")),
			is_channel: isChannel,
			isPublic: isPublic,
			isProtected: false, // a modifier avec une valeur en useState?
			password: isPublic ? '' : passwordValue,
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
		setIsPublic(true);
		setPasswordValue('');
	};

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
			handleCancel();
			}
		};
		document.addEventListener('keydown', handleEscape);
		return () => {
		document.removeEventListener('keydown', handleEscape);
		};
	}, []);

	return (
		<>
			<div className="blur-background"></div>
			<img className="add_button_cancel" src='./close.png'  onClick={handleCancel}/>
			<div className="add_container">
				<h2 className="add__title">{title}</h2>	
				<div className="add__header">
					<div className="bloc-add-conversation">
						<div className="add__body">
							<form className="add__form" onSubmit={(e) => handleConversationCreation(e)}>
								<input
									className="add__input"
									type="text"
									placeholder="channel"
									value={formValue}
									onChange={(e) => setFormValue(e.target.value)}
								/>
								<div className='privated-public'>
									{isPassword ?
											<img className='password-img' src="passowrd.png" onClick={() => setIsPassowrd(false)} />
											:
											<img className='password-img' src="no-password.png" onClick={() => setIsPassowrd(true)} />}
									{isPassword && (
										<input
											className="add__input"
											type="password"
											placeholder="Mot de passe"
											value={passwordValue}
											onChange={(e) => setPasswordValue(e.target.value)}
										/>
									)}
									<button className="add__button" type="submit">
										create
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default AddConversationComponent;