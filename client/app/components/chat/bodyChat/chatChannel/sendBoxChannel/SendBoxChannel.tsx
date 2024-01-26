import './SendBoxChannel.css'
import React, { useState } from 'react';
import { Socket } from 'socket.io-client'
import { useChat } from '../../../ChatContext'
import { useGlobal } from '@/app/GlobalContext';

const SendBoxChannelComponent: React.FC = () => {

	const { chatState } = useChat();
	const { globalState } = useGlobal();
	const [messageValue, setMessageValue] = useState('');

	const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageValue(e.target.value);
	};
	
	
	const handleMessage = async (e: React.FormEvent) => {
		
		try {
			e.preventDefault();

			const messageDto = {
				from: sessionStorage.getItem("currentUserLogin"),
				content: messageValue,
				post_datetime: new Date(),
				conversationID: chatState.currentConversationID,
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
				if (globalState.userSocket?.connected) {
					globalState.userSocket?.emit('message', { dto: messageDto, conversationName: chatState.currentConversation });
				}
				else {
					console.log("Client is not connected");
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
				<form className="bloc-send-chat-channel" onSubmit={handleMessage}>
					<input className="input-chat-channel" placeholder="message..." value={messageValue} onChange={handleMessageInput}></input>
				</form>
			</div>
	)
};
export default SendBoxChannelComponent;