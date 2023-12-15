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
			},
			body: JSON.stringify(conversationDto),
		});

		if (response.ok) {
			const data = await response.json();
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 0d88287 (Reworked game directory architecture and files)

=======
			const roomDto = {
				roomName: data.name,
				userID: 1,
			}
			console.log("RoomDto : ", roomDto);
>>>>>>> 6a57fb4 (misere jpp)
=======

>>>>>>> e59c4d4 (Now sockets are emitting into rooms for CHANNEL (Dms will work the same but its not done yet))
			if (socketInUse.connected) {
				await socketInUse.emit('joinRoom', data.name, () => {
					console.log("Room creation loading...");
				});
				socketInUse.off('joinRoom');
			}
=======
			const roomDto = {
				roomName: data.name,
				userID: 1,
			}
			console.log("RoomDto : ", roomDto);
			if (socketInUse.connected) {
				socketInUse.emit('joinRoom', roomDto, () => {
					console.log("Room creation loading...");
				});
				socketInUse.off('joinRoom');
			}
>>>>>>> 011b9f5 (Reworked game directory architecture and files)
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
			const data = await response.json();

			const socketFriendRequestDto = {
				// socketInUse = initiator
				client: socketInUse.id,
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