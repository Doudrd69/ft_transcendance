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
	// const [messageContent, setMessageContent] = useState("");
	// const [dateSent, setDateSent] = useState("");
  
	// Reakl-time message rendering
	useEffect(() => {
	  // Set up the event listener for 'onMessage' when the component mounts
	  const onMessageHandler = (data: any) => {
		console.log(data);
		// setMessageContent(data.content);
		// setDateSent(data.date);
		setMessages((prevMessages: any) => [...prevMessages, data.content]);
	  };
	  
	  socketInUse.on('onMessage', onMessageHandler);
	  // Clean up the event listener when the component is unmounted
	  return () => {
		  socketInUse.off('onMessage', onMessageHandler);
		};
	}, [socketInUse]);

	const getMessage = async (e: React.FormEvent) => {

		e.preventDefault();

		try {
			const response = await fetch ('http://localhost/chat/${conversationName}', {
				method: 'GET',
			});

			if (response.ok) {
				const messageList = await response.json();
				setMessages((prevMessages: any) => [...prevMessages, messageList]);
			}
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<div className="bloc-discussion-chat">
			{messages.map((message: any) => (
				<>
					<p className="discussion-chat">{message.content}</p>
					<p className="discussion-chat">{message.date}</p>
				</>
		))}
		</div>
	)
};
export default ChatDiscussionComponent;