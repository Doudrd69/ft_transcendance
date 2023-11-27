import './ChatDiscussion.css'
import React, { useState , useEffect } from 'react';
import { Socket } from 'socket.io-client'

interface Message {
	content: string;
	date: Date;
}

const ChatDiscussionComponent = (socket: {socket: Socket}) => {

	const conversationName = "test";
	const socketInUse = socket.socket;
	const [messages, setMessages] = useState<Message[]>([]);

	// This function will retreive all the messages from the conversation and set the messages array for display
	const getMessage = async () => {
		
		try {
			const response = await fetch (`http://localhost:3001/chat/getMessages/${conversationName}`, {
				method: 'GET',
			});
			
			if (response.ok) {
				const messageList = await response.json();
				if (messageList)
					setMessages((prevMessages: Message[]) => [...prevMessages, ...messageList]);
				else
					console.log("No messages for this conversation");
			}
		} catch (error) {
			console.log(error);
		}
	}

	// Here we retreive the last sent message and we "insert" it in the messages array
	useEffect(() => {
		socketInUse.on('onMessage', (message: Message) => {
			if (message)
				setMessages((prevMessages: Message[]) => [...prevMessages, message]);
		});
		
		return () => {
			socketInUse.off('onMessage')
		}
	}, [socketInUse]);
	
	// Loading the conversation (retrieving all messages on component rendering)
	useEffect(() => {
		getMessage();
	}, []);

	return (
		<div className="bloc-discussion-chat">
			{messages.map((message: Message) => (
				<>
					<p className="discussion-chat">{message.content}</p>
				</>
			))}
		</div>
	)
};
export default ChatDiscussionComponent;

// {rows.map((row) => {
// 	return <ObjectRow key={row.uniqueId} />;
// })}