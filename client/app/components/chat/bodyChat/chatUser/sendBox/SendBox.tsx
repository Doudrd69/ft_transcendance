import './SendBox.css'
import React, { useState } from 'react';

const SendBoxComponent: React.FC = () => {

	const [messageValue, setMessageValue] = useState('');

	const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageValue(e.target.value); // Update conversationValue state with the input value
	};

	const handleMessage = async (e: React.FormEvent) => {

		e.preventDefault();

		const messageDto = {
			from_login: "ebrodeur",
			content: messageValue,
			post_datetime: new Date(),
			conversationName: "CoucouLeChannel",
		}
		const response = await fetch('http://localhost:3001/chat/newMessage', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(messageDto),
		});

		if (response.ok) {
			console.log("Message sent and created in DB");
		}
		else {
			console.log("Message creation failed");
		}
	}

	return (
				<form className="bloc-send-chat" onSubmit={handleMessage}>
					<input className="input-chat" placeholder="message..." value={messageValue} onChange={handleMessageInput}></input>
					<button className="button-send" type="submit"></button>
				</form>
	)
};
export default SendBoxComponent;