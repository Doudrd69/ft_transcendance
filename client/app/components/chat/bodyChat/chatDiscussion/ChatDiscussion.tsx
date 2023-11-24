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
	const [newMessage, setNewMessage] = useState<Message | undefined>();

	
	// Here we retreive the last sent message and set the newMessage for instant display 
	useEffect(() => {
		socketInUse.on('onMessage', (message: Message) => {
			console.log("== TRIGGERED ==");
			setNewMessage(message);
		});
		
		return () => {
			console.log("Cleaning socket event");
			socketInUse.off('onMessage')
		}
	}, [socketInUse, messages]);
	
	// This function will retreive all the messages from the conversation and set the messages array for display
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

	useEffect(() => {
		getMessage();
	}, []);

	useEffect(() => {
		if (newMessage) {
			console.log("== CHECK ==");
			setMessages((prevMessages: Message[]) => [...prevMessages, newMessage]);
		}
	}, [newMessage])

	return (
		<div className="bloc-discussion-chat">
			{messages.map((message: Message) => (
				<>
					<p className="discussion-chat">{message.content}</p>
				</>
			))}
			{newMessage && <p className="discussion-chat">{newMessage.content}</p>}
		</div>
	)
};
export default ChatDiscussionComponent;