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

		console.log("Conversation to create :", formValues[index]);
		const user = sessionStorage.getItem("currentUserLogin");
		const response = await fetch('http://localhost:3001/chat/newConversation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({formValue: formValues[index], user}),
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

		console.log("Friend to add :", formValues[index]);
		const friendRequestDto = {
			initiatorLogin: sessionStorage.getItem("currentUserLogin"), // à remplacer
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
			console.log("Friend request successfully created");
			if (socketInUse.connected) {
				socketInUse.emit('addFriend', friendRequestDto, () => {
					console.log("FriendRequest sent to General gateway");
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
