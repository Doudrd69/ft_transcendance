import './SendBox.css'
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client'
import { useChat } from '../../../ChatContext';
import { useGlobal } from '@/app/GlobalContext';

const SendBoxComponent: React.FC = () => {

	const { chatState } = useChat();
	const { globalState } = useGlobal();
	const [messageValue, setMessageValue] = useState('');
	
	const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageValue(e.target.value);
	};
	
	const handleMessage = async (e: React.FormEvent) => {
		const messageDto = {
			from: sessionStorage.getItem("currentUserLogin"),
			content: messageValue,
			post_datetime: new Date(),
			conversationID: chatState.currentConversationID,
		}
		// console.log("messageDto", messageDto);
		try {
			e.preventDefault();
	
			const response = await fetch(`${process.env.API_URL}/chat/newMessage`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(messageDto),
			});
			
			if (response.ok) {
				console.log('globalState.userSocket?.connected', globalState.userSocket?.connected);
				console.log('messageDto', messageDto);
				console.log('chatState.currentRoom', chatState.currentRoom);
				if (globalState.userSocket?.connected) {
					globalState.userSocket?.emit('message', { dto: messageDto, conversationName: chatState.currentRoom });
				}
				setMessageValue('');
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	return (
			<div className="bloc-chat-enter">
				<form className="bloc-send-chat" onSubmit={handleMessage}>
					<input className="input-chat" placeholder="message..." value={messageValue} onChange={handleMessageInput}></input>
					{/* <button className="button-send" type="submit"></button> */}
				</form>
			</div>
	)
};
export default SendBoxComponent;