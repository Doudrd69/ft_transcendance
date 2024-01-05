import './SendBoxChannel.css'
import React, { useState } from 'react';
import { Socket } from 'socket.io-client'
import { useChat } from '../../../ChatContext'

interface SendBoxComponentProps {
	userSocket: Socket;
}

const SendBoxChannelComponent: React.FC<SendBoxComponentProps> = ({ userSocket }) => {

	const { state } = useChat();
	const socketInUse = userSocket;
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

	const handleMessage = async (e: React.FormEvent) => {
		
		e.preventDefault();

		
		const response = await fetch('http://localhost:3001/chat/newMessage', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			},
			body: JSON.stringify(messageDto),
		});

		if (response.ok) {
			if (socketInUse.connected) {
				socketInUse.emit('message', { dto: messageDto, conversationName: state.currentConversation });
			}
			else {
				console.log("Client is not connected");
			}
		}
		else {
			const error = await response.json();
			if (Array.isArray(error.message))
				console.log("Error: ", error.message[0]);
			else
				console.log("Error: ", error.message);
		}
	}

	return (
				<form className="bloc-send-chat-channel" onSubmit={handleMessage}>
					<input className="input-chat-channel" placeholder="message..." value={messageValue} onChange={handleMessageInput}></input>
					<button className="button-send-channel" type="submit"></button>
				</form>
	)
};
export default SendBoxChannelComponent;