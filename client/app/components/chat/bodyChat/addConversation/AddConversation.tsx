import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import './AddConversation.css';
import { useGlobal } from '@/app/GlobalContext';

interface AddConversationComponentProps {
	loadDiscussions: () => void;
	title: string;
	isChannel: boolean;
}

const AddConversationComponent: React.FC<AddConversationComponentProps> = ({ loadDiscussions, title, isChannel}) => {

	const { globalState } = useGlobal();

	const [formValue, setFormValue] = useState('');
	const [passwordValue, setPasswordValue] = useState('');
	const { chatState, chatDispatch } = useChat();
	const [isPassword, setIsPassowrd] = useState(false);
	const [isPublic, setIsPublic] = useState(true);

	const handleConversationCreation = async (e: React.FormEvent) => {
		try{

			e.preventDefault();

			const conversationDto = {
				name: formValue,
				userID: Number(sessionStorage.getItem("currentUserID")),
				is_channel: isChannel,
				isPublic: isPublic,
				isProtected: isPassword,
				password: !isPassword ? '' : passwordValue,
			}

			const response = await fetch(`${process.env.API_URL}/chat/newConversation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				},
				body: JSON.stringify(conversationDto),
			});

			if (response.ok) {

				const data = await response.json();

				if (globalState.userSocket?.connected) {
					globalState.userSocket?.emit('joinRoom', { roomName: data.name, roomID: data.id });
				}
		
				console.log("Conversation successfully created");
				chatDispatch({ type: 'DISABLE', payload: 'showCreateChannel' });
				chatDispatch({ type: 'DISABLE', payload: 'showAddCreateChannel' });
				chatDispatch({ type: 'TOGGLEX', payload: 'refreshChannel'});
				
			}
		}
		catch(error) {
			console.log(error);
		}
	};

	const handleCancel = () => {
		chatDispatch({ type: 'DISABLE', payload: 'showAddChannel' });
		chatDispatch({ type: 'DISABLE', payload: 'showAddUser' });
		chatDispatch({ type: 'DISABLE', payload: 'showAddFriend' });
		chatDispatch({ type: 'DISABLE', payload: 'showListChannelAdd' });
		chatDispatch({ type: 'DISABLE', payload: 'showAddChannel' });
		chatDispatch({ type: 'DISABLE', payload: 'showCreateChannel' });
		chatDispatch({ type: 'DISABLE', payload: 'showAddCreateChannel' });
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

	const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
		// Call the function you want to execute when the image is clicked
		// For example, you can call handleConversationCreation here
		handleConversationCreation(e);
	};
	
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
									{isPublic ?
											<img className='public-img' src="./public.png" onClick={() => setIsPublic(false)} />
											:
											<img className='public-img' src="./private.png" onClick={() => setIsPublic(true)} />}
									{isPassword ?
											<img className='password-img' src="./password.png" onClick={() => setIsPassowrd(false)} />
											:
											<img className='password-img' src="./no-password.png" onClick={() => setIsPassowrd(true)} />}
									{isPassword && (
										<input
											className="add__input"
											type="password"
											placeholder="Mot de passe"
											value={passwordValue}
											onChange={(e) => setPasswordValue(e.target.value)}
										/>
									)}
									<img className='img-enter-conversation' src="enter.png" onClick={(e) => handleImageClick(e)} />
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