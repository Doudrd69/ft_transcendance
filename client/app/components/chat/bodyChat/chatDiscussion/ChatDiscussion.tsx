import './ReceiveBox.css'
import React, { useState , useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client'
import { useChat } from '../../../ChatContext';

interface Message {
	from: string;
	content: string;
	post_datetime: string;
	conversationName: string;
}

const ReceiveBoxComponent = (socket: {socket: Socket}) => {

<<<<<<< HEAD
	const { state } = useChat();
	// const conversationName = state.currentConversation;
=======
	const formatDateTime = (dateTimeString: string) => {
		const options = {
		  day: 'numeric',
		  month: 'numeric',
		  year: 'numeric',
		  hour: '2-digit',
		  minute: '2-digit',
		  second: '2-digit',
		};
	  
		const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(new Date(dateTimeString));
		return formattedDate;
	  };

	const conversationName = "test2";
>>>>>>> c98ea9b (Display fixed)
	const socketInUse = socket.socket;
	const [messages, setMessages] = useState<Message[]>([]);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	
	const isMyMessage = (message: Message): boolean => {
		return message.from === sessionStorage.getItem("currentUserLogin");
	};

	const scrollToBottom = () => {
		if (messagesContainerRef.current) {
		  const container = messagesContainerRef.current;
		  container.scrollTop = container.scrollHeight;
		}
	};
	
	const formatDateTime = (dateTimeString: string) => {
		const options: Intl.DateTimeFormatOptions = {
		  day: 'numeric',
		  month: 'numeric',
		  year: 'numeric',
		  hour: '2-digit',
		  minute: '2-digit',
		  second: '2-digit',
		};
	  
		const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(new Date(dateTimeString));
		return formattedDate;
	  };

	// This function will retreive all the messages from the conversation and set the messages array for display
	const getMessage = async () => {
		
		try {
			const response = await fetch (`http://localhost:3001/chat/getMessages/${state.currentConversation}`, {
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
		console.log("Loading conversation...");
		getMessage();
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	return (

		<div ref={messagesContainerRef} className="bloc-discussion-chat">
			{messages.map((message: Message) => (
				<>
					<div className={`message-container ${isMyMessage(message) ? 'my-message' : 'other-message'}`}>
						<p className="discussion-chat-content">{message.content}</p>
						<p className="discussion-chat-date">{formatDateTime(message.post_datetime)}</p>
					</div>
				</>
			))}
		</div>
	)
};
export default ReceiveBoxComponent;
