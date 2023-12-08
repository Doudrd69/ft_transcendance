import './Add.css';
import React, { useState } from 'react';
import { Socket } from 'socket.io-client';

const AddComponent = (socket: {socket: Socket}) => {

	const socketInUse = socket.socket;
	const [formValues, setFormValues] = useState<string[]>(['', '', '']); // Initialisez les valeurs par défaut

	const handleFormInput = (value: string, index: number) => {
		const updatedFormValues = [...formValues];
		updatedFormValues[index] = value;
		setFormValues(updatedFormValues);
	};

	const handleConversationCreation = async (e: React.FormEvent, index: number) => {

		e.preventDefault();

		const conversationDto = {
			name: formValues[index],
			is_channel: true,
			username: sessionStorage.getItem("currentUserLogin"),
			is_channel: true,
		}
		console.log(conversationDto);

		const response = await fetch('http://localhost:3001/chat/newConversation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(conversationDto),
		});

		if (response.ok) {
			console.log("Conversation successfully created");
		}
		else {
			console.log("Conversation creation failed");
		}
		return false;
	}

	const handleFriendRequest = async (e: React.FormEvent, index: number) => {

		e.preventDefault();

		const friendRequestDto = {
			initiatorLogin: sessionStorage.getItem("currentUserLogin"),
			recipientLogin: formValues[index],
		}

		const response = await fetch('http://localhost:3001/users/addfriend', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(friendRequestDto),
		});
		
		if (response.ok) {
			const data = await response.text();
			const parsedData = data ? JSON.parse(data) : null;
		
			console.log("From back --> ", parsedData);

			if (socketInUse.connected && parsedData) {
				socketInUse.emit('addFriend', friendRequestDto, () => {
					console.log("FriendRequest sent to gateway");
				});
			}
		}
		else {
			console.log("Friend request creation failed");
		}
	}

	const placeholders = ["Ajouter un ami...", "Creer un channel...", "Inviter à jouer une partie..."];
	const handleFunctions = [handleFriendRequest, handleConversationCreation];

	return (
		<div className="block-main">
			{placeholders.map((placeholder, index) => (
				<div className="block-add" key={index}>
					<form  className="input-add" onSubmit={(e) => handleFunctions[index](e, index)}>
						<input className="test" type="text" placeholder={placeholder} value={formValues[index]} onChange={(e) => handleFormInput(e.target.value, index)}/>
					</form>
					<button className="button-add" type="submit"></button>
				</div>
			))}
		</div>
	);
};

export default AddComponent;