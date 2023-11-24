import './Message.css'
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client'

const MessageComponent = (socket: {socket: Socket}) => {

	const socketInUse = socket.socket;
	console.log("Socket ID in message", socket.socket.id);
	const [messageValue, setMessageValue] = useState('');

	const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageValue(e.target.value);
	};
	
	const messageDto = {
		from_login: sessionStorage.getItem("currentUserLogin"),
		content: messageValue,
		post_datetime: new Date(),
		conversationName: "test",
	}

	const handleMessage = async (e: React.FormEvent) => {

		e.preventDefault();

		if (socketInUse.connected) {
	
			socketInUse.emit('message', messageDto, () => {
				console.log("Message has been sent");
			});
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
	
	// useEffect(() => {
	// 	else {
	// 		console.log("Socket not connected");
	// 	}

	// 	return () => {
	// 		socketInUse.off('message');
	// 	}
	// }, [socketInUse])

	return (
			<div className="bloc-message">
				<form onSubmit={handleMessage}>
					<input className="message" placeholder="message..." value={messageValue} onChange={handleMessageInput}></input>
					<button className="buttom-message" type="submit"></button>
				</form>
			</div>
	)
};
export default MessageComponent;