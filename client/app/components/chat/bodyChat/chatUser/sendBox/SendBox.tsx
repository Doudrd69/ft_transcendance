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
	
	const messageDto = {
		from: sessionStorage.getItem("currentUserLogin"),
		content: messageValue,
		post_datetime: new Date(),
		conversationID: state.currentConversationID,
	}

	const handleMessage = async (e: React.FormEvent) => {

		try {
			e.preventDefault();
	
			console.log("DTO --> ", messageDto);
	
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
				console.log("----> ", state.currentRoom);
				if (globalState.userSocket?.connected) {
				globalState.userSocket?.emit('message', { dto: messageDto, conversationName: state.currentRoom } , () => {
					console.log("Message sent to gateway");
				});
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