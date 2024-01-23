import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import './AddConversation.css';
import { useGlobal } from '@/app/GlobalContext';

interface AddFriendComponentProps {
	updateFriends: () => void;
	title: string;
}

const AddFriendComponent: React.FC<AddFriendComponentProps> = ({ updateFriends, title }) => {

	const [formValue, setFormValue] = useState('');
	const { state, dispatch } = useChat();
	const { globalState } = useGlobal();

	const handleFriendRequest = async (e: React.FormEvent) => {
		try {
			e.preventDefault();

			const friendRequestDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: formValue,
			};

			const response = await fetch('http://localhost:3001/users/addfriend', {
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
					console.log("Request denied, please enter a valid username");
					return;
				}
				
				dispatch({ type: 'TOGGLEX', payload: 'refreshFriendsList' });
				dispatch({ type: 'DISABLE', payload: 'showAddChannel' });
				dispatch({ type: 'DISABLE', payload: 'showAddUser' });
				dispatch({ type: 'DISABLE', payload: 'showAddFriend' });

				if (globalState.userSocket?.connected) {
					globalState.userSocket?.emit('joinRoom', { roomName: data.name, roomID: data.id });
					globalState.userSocket?.emit('addFriend', friendRequestDto);
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleCancel = () => {
		dispatch({ type: 'DISABLE', payload: 'showAddChannel' });
		dispatch({ type: 'DISABLE', payload: 'showAddUser' });
		dispatch({ type: 'DISABLE', payload: 'showAddFriend' });
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
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default AddFriendComponent;
