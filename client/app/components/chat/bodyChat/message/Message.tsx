import './Message.css'
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client'

const MessageComponent = (socket: {socket: Socket}) => {

	const socketInUse = socket.socket;
	const [messageValue, setMessageValue] = useState('');

	const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageValue(e.target.value);
	};
	
	const messageDto = {
		// from: sessionStorage.getItem("currentUserLogin"),
		from: "ebrodeur",
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