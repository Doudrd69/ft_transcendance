import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import './AddConversation.css';

interface AddFriendComponentProps {
socket: Socket;
updateFriends: () => void;
title: string;
}

const AddFriendComponent: React.FC<AddFriendComponentProps> = ({ socket, updateFriends, title }) => {
const [formValue, setFormValue] = useState('');
const { state, dispatch } = useChat();

const handleFriendRequest = async (e: React.FormEvent) => {
	e.preventDefault();

	console.log("Friend to add :", formValue);
	const friendRequestDto = {
	initiatorLogin: sessionStorage.getItem("currentUserLogin"), // à remplacer
	recipientLogin: formValue,
	};

	const response = await fetch('http://localhost:3001/users/addfriend', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
	},
	body: JSON.stringify(friendRequestDto),
	});

	if (response.ok) {
		dispatch({ type: 'DISABLE', payload: 'showAddChannel' });
		dispatch({ type: 'DISABLE', payload: 'showAddUser' });
		dispatch({ type: 'DISABLE', payload: 'showAddFriend' });
	console.log("Friend request successfully created");
	if (socket.connected) {
		socket.emit('addFriend', friendRequestDto, () => {
		console.log("FriendRequest sent to General gateway");
		});
	}
	} else {
	console.log("Friend request creation failed");
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
		<form className="add__form" onSubmit={(e) => handleFriendRequest(e)}>
			<input
				className="add__input"
				type="text"
				placeholder="Friend username"
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

export default AddFriendComponent;