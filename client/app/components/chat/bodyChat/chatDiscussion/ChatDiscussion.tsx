import './ChatDiscussion.css'
import React, { useState , useEffect } from 'react';
import { Socket } from 'socket.io-client'

interface Message {
	content: string;
	date: string;
}

const ChatDiscussionComponent = (socket: {socket: Socket}) => {

	const conversationName = "test";
	const socketInUse = socket.socket;
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");


	socketInUse.on('onMessage', (message: Message) => {
		console.log("Received message from gateway: ", message.content);
		setNewMessage(message.content);

		getMessage();
	});

	const getMessage = async () => {
		
		try {
			const response = await fetch (`http://localhost:3001/chat/getMessages/${conversationName}`, {
				method: 'GET',
			});
			
			if (response.ok) {
				const messageList = await response.json();
				setMessages((prevMessages: Message[]) => [...prevMessages, ...messageList]);
			}
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<div className="bloc-discussion-chat">
			<p className="discussion-chat">{newMessage}</p>
			{messages.map((message: Message) => (
				<>
					<p className="discussion-chat">{message.content}</p>
				</>
			))}
		</div>
	)
};
export default ChatDiscussionComponent;

// On affiche d'abord l'historique des messages
// Ensuite on affiche le dernier message envoye grace a la bdd
// On envoie le nouveau message en direct grace au socket