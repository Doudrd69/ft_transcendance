import './Add.css';
import React, { useState } from 'react';

const AddComponent: React.FC = () => {

	const [formValue, setFormValue] = useState('');

	const handleFormInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormValue(e.target.value); // Update conversationValue state with the input value
	};

	const handleConversationCreation = async (e: React.FormEvent) => {

		e.preventDefault();

		console.log("Conversation to create :", formValue);
		const socketValue = 1; // for testing purpose
		const response = await fetch('http://localhost:3001/chat/newConversation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({formValue, socketValue}),
		});

		if (response.ok) {
			console.log("Conversation successfully created");
		}
		else {
			console.log("Conversation creation failed");
		}
	}

	const handleFriendRequest = async (e: React.FormEvent) => {

		e.preventDefault();

		console.log("Friend to add :", formValue);
		const friendRequestDto = {
			initiatorLogin: "ebrodeur", // to replace
			recipientLogin: formValue,
		}
		const response = await fetch('http://localhost:3001/users/addfriend', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({friendRequestDto}),
		});

		if (response.ok) {
			console.log("Friend request successfully created");
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
					<form onSubmit={handleFunctions[index]}>
						<input className="input-add" type="text" placeholder={placeholder} value={formValue} onChange={handleFormInput} />
						<button className="button-add" type="submit"></button>
					</form>
				</div>
			))}
		</div>
	);
};

export default AddComponent;
