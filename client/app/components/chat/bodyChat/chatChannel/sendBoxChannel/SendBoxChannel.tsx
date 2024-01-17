import './SendBoxChannel.css'
import React, { useState } from 'react';
import { Socket } from 'socket.io-client'
import { useChat } from '../../../ChatContext'
import { useGlobal } from '@/app/GlobalContext';

const SendBoxChannelComponent: React.FC = () => {

	const { state } = useChat();
	const { globalState } = useGlobal();
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
			const data = await response.json();
			console.log(data);
			// c'est misereux, a revoir
			if (data) {
				// if (globalState.userSocket?.connected) {
					globalState.userSocket?.emit('message', { dto: messageDto, conversationName: state.currentConversation });
				// }
				// else {
				// 	console.log("Client is not connected");
				// }
			}
			else {
				console.log("Fatal error");
			}
			setMessageValue('');
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
		<div className="bloc-chat-enter">
				<form className="bloc-send-chat-channel" onSubmit={handleMessage}>
					<input className="input-chat-channel" placeholder="message..." value={messageValue} onChange={handleMessageInput}></input>
				</form>
			</div>
	)
};
export default SendBoxChannelComponent;