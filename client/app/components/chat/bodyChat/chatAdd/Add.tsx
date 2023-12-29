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
			userID: sessionStorage.getItem("currentUserID"),
			is_channel: true,
		}

		const response = await fetch('http://localhost:3001/chat/newConversation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			},
			body: JSON.stringify(conversationDto),
		});

		if (response.ok) {
			const data = await response.json();

			if (socketInUse.connected) {
				await socketInUse.emit('joinRoom', { roomName: data.name, roomID: data.id }, () => {
					console.log("Room creation loading...");
				});
				socketInUse.off('joinRoom');
			}
			console.log("Conversation successfully created");
		}
		else {
			console.log("Conversation creation failed");
			const error = await response.json();
			console.log("Error: ", error.message[0]);
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
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			},
			body: JSON.stringify(friendRequestDto),
		});
		
		if (response.ok) {
			const data = await response.json();

			const socketFriendRequestDto = {
				recipientID: data.friend.id,
				recipientLogin: data.friend.login,
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
			}

			if (socketInUse.connected && data) {
				socketInUse.emit('addFriend', socketFriendRequestDto, () => {
					console.log("FriendRequest sent to gateway");
				});
			}
		}
		else {
			console.log("Friend request failed");
			const error = await response.json();
			console.log("Error: ", error.message[0]);
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