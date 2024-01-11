import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import './AddConversation.css';

interface AddFriendComponentProps {
	userSocket: Socket;
	updateFriends: () => void;
	title: string;
}

const AddFriendComponent: React.FC<AddFriendComponentProps> = ({ userSocket, updateFriends, title }) => {

	const [formValue, setFormValue] = useState('');
	const { state, dispatch } = useChat();

	const handleFriendRequest = async (e: React.FormEvent) => {

		e.preventDefault();

		console.log("Friend to add :", formValue);

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

			dispatch({ type: 'TOGGLEX', payload: 'refreshFriendsList'});

			const data = await response.json();

			if (data.isAccepted) {
				console.log("A friendrequest has already been sent to this user.");
				return ;
			}

			if (!data) {
				console.log("Request denied, please enter a valid username");
				return ;
			}

			dispatch({ type: 'DISABLE', payload: 'showAddChannel' });
			dispatch({ type: 'DISABLE', payload: 'showAddUser' });
			dispatch({ type: 'DISABLE', payload: 'showAddFriend' });
			
			console.log("Friend request successfully created");

			if (userSocket.connected) {
				userSocket.emit('addFriend', friendRequestDto, () => {
					console.log("FriendRequest sent to General gateway");
				});
			}
		}
		else {
			console.log("Fatal error: friend request failed");
			const error = await response.json();
			if (error.message) {
				console.log(error.message[0]);
			}
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
			<img className="add_button_cancel" src='./close.png'  onClick={handleCancel}/>
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
