import './SendBox.css'
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client'
import { useChat } from '../../../ChatContext';
import { useGlobal } from '@/app/GlobalContext';

const SendBoxComponent: React.FC = () => {

	const { state } = useChat();
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
			conversationID: state.currentConversationID,
		}
		console.log("messageDto", messageDto);
		try {
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
				console.log('globalState.userSocket?.connected', globalState.userSocket?.connected);
				console.log('messageDto', messageDto);
				console.log('state.currentRoom', state.currentRoom);
				if (globalState.userSocket?.connected) {
					globalState.userSocket?.emit('message', { dto: messageDto, conversationName: state.currentRoom });
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