import './game.css';
import React, { useState } from 'react';

const GameComponent = () => {

	const [conversationValue, setConversationValue] = useState('');
	const [messageValue, setMessageValue] = useState('');

	const handleConvInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setConversationValue(e.target.value); // Update conversationValue state with the input value
	  };

	  const handleMessInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageValue(e.target.value); // Update conversationValue state with the input value
	  };

	const handleConversationCreation = async (e: React.FormEvent) => {

		e.preventDefault();

		console.log(conversationValue);
		const response = await fetch('http://localhost:3001/chat/newConversation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({conversationValue}),
		});

		if (response.ok) {
			console.log("Conversation successfully created");
		}
		else {
			console.log("Conversation creation failed");
		}
	}

	const handleMessageCreation = async (e: React.FormEvent) => {

		e.preventDefault();

		console.log(messageValue);
		const messageDto = {
			from_user: "ebrodeur",
			content: messageValue,
			post_datetime: new Date(),
			conversationName: "test",
		}
		const response = await fetch('http://localhost:3001/chat/newMessage', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(messageDto),
		});

		if (response.ok) {
			console.log("Message sent and created");
		}
		else {
			console.log("Error creating message");
		}
	}

	return (
		<div className="right-half">
			<h1>PONG !</h1>
			<form onSubmit={handleConversationCreation}>
				<input type="text" value={conversationValue} onChange={handleConvInput}></input>
				<button type="submit">Creer</button>
			</form>

			<form onSubmit={handleMessageCreation}>
				<input type="text" value={messageValue} onChange={handleMessInput}></input>
				<button type="submit">Envoyer</button>
			</form>
		</div>
	)
};

	export default GameComponent;