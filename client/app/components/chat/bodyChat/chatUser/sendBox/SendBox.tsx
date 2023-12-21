import './SendBox.css'
import React, { useState } from 'react';
import { Socket } from 'socket.io-client'
import { useChat } from '../../../ChatContext';

const SendBoxComponent = (socket: {socket: Socket}) => {

	const { state } = useChat();
	const socketInUse = socket.socket;
	const [messageValue, setMessageValue] = useState('');

	const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageValue(e.target.value);
	};
	
	const messageDto = {
		from: sessionStorage.getItem("currentUserLogin"),
		content: messageValue,
		post_datetime: new Date(),
		conversationID: state.currentConversationID,
	}

	const messageEventDto = {
		from: sessionStorage.getItem("currentUserLogin"),
		content: messageValue,
		post_datetime: new Date(),
		conversationID: state.currentConversationID,
		conversationName: state.currentConversation,
	}

	const handleMessage = async (e: React.FormEvent) => {

		e.preventDefault();

		if (socketInUse.connected) {
			socketInUse.emit('message', messageEventDto, () => {
				console.log("Message sent!");
			});
			socketInUse.off('message');
		}
		else {
			console.log("Socket not connected");
		}

		const response = await fetch('http://localhost:3001/chat/newMessage', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(messageDto),
		});
				
		if (response.ok) {
			console.log("Message sent and created in DB");
		}
		else {
			const error = await response.json();
			console.log("Error: ", error.message[0]);
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