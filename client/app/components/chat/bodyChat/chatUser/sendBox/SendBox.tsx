import './SendBox.css'
import React, { useState } from 'react';
import { Socket } from 'socket.io-client'

const SendBoxComponent = (socket: {socket: Socket}) => {

	const socketInUse = socket.socket;
	const [messageValue, setMessageValue] = useState('');

	const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageValue(e.target.value);
	};
	
	const messageDto = {
		from: sessionStorage.getItem("currentUserLogin"), // when 42log is true
		// from: "ebrodeur",	// when 42log is false
		content: messageValue,
		post_datetime: new Date(),
		conversationName: "test2",
	}

	const handleMessage = async (e: React.FormEvent) => {

		e.preventDefault();

		if (socketInUse.connected) {
				socketInUse.emit('message', messageDto, () => {
					console.log("!! SOCKET EMIT on message !!");
				});
			socketInUse.off('message');

			if (socketInUse.connected) {
				socketInUse.emit('message', messageDto, () => {
					console.log("Message Sent!");
				});
			}
			else {
				console.log("Socket not connected");
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
	}

	return (
				<form className="bloc-send-chat" onSubmit={handleMessage}>
					<input className="input-chat" placeholder="message..." value={messageValue} onChange={handleMessageInput}></input>
					<button className="button-send" type="submit"></button>
				</form>
	)
};
export default SendBoxComponent;