import './SendBoxChannel.css'
import React, { useState } from 'react';
import { Socket } from 'socket.io-client'
import { useChat } from '../../../ChatContext'

const SendBoxChannelComponent = (socket: {socket: Socket}) => {

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
		conversationName: state.currentConversation,
	}

	const handleMessage = async (e: React.FormEvent) => {

		e.preventDefault();

		if (socketInUse.connected) {
				socketInUse.emit('message', messageDto, () => {
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
				<form className="bloc-send-chat-channel" onSubmit={handleMessage}>
					<input className="input-chat-channel" placeholder="message..." value={messageValue} onChange={handleMessageInput}></input>
					<button className="button-send-channel" type="submit"></button>
				</form>
	)
};
export default SendBoxChannelComponent;