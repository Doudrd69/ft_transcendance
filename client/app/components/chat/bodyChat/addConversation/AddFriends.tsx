import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import './AddConversation.css';
import { useGlobal } from '@/app/GlobalContext';
import { toast } from 'react-toastify';

interface AddFriendComponentProps {
	updateFriends: () => void;
	title: string;
}

const AddFriendComponent: React.FC<AddFriendComponentProps> = ({ updateFriends, title }) => {

	const [formValue, setFormValue] = useState('');
	const { chatState, chatDispatch } = useChat();
	const { globalState } = useGlobal();

	const handleFriendRequest = async (e: React.FormEvent) => {

		e.preventDefault();

		try {

			const friendRequestDto = {
				recipientLogin: formValue,
			};

			const response = await fetch(`${process.env.API_URL}/users/addfriend`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(friendRequestDto),
			});

			if (response.ok) {
				
				const data = await response.json();
				if (!data) {
					return;
				}
				
				chatDispatch({ type: 'TOGGLEX', payload: 'refreshFriendsList' });
				chatDispatch({ type: 'DISABLE', payload: 'showAddChannel' });
				chatDispatch({ type: 'DISABLE', payload: 'showAddUser' });
				chatDispatch({ type: 'DISABLE', payload: 'showAddFriend' });

				if (globalState.userSocket?.connected) {
					globalState.userSocket?.emit('joinRoom', { roomName: data.name, roomID: data.id });
					globalState.userSocket?.emit('addFriend',  { recipient: friendRequestDto.recipientLogin } );
				}
			} else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleCancel = () => {
		chatDispatch({ type: 'DISABLE', payload: 'showAddChannel' });
		chatDispatch({ type: 'DISABLE', payload: 'showAddUser' });
		chatDispatch({ type: 'DISABLE', payload: 'showAddFriend' });
		setFormValue('');
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
			<img className="add_button_cancel" src='./close.png' onClick={handleCancel} />
			<div className="add_container">
				<h2 className="add__title">{title}</h2>
				<div className="add__header">
					<div className="bloc-add-conversation">
						<div className="add__body">
							<form className="add__form" onSubmit={(e) => handleFriendRequest(e)}>
								<input
									className="add__input"
									type="text"
									placeholder="name"
									value={formValue}
									onChange={(e) => setFormValue(e.target.value)}
								/>
							</form>
							<button
								className='button-ok'
								onClick={(e) => {
									handleFriendRequest(e);
									handleCancel();
								}}
								>
								OK
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default AddFriendComponent;
