import './ReceiveBoxChannel.css'
import React, { useState , useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client'
import { useChat } from '../../../ChatContext';

interface Message {
	from: string;
	content: string;
	post_datetime: string;
	conversationID: number;
}

const ReceiveBoxChannelComponent = (socket: {socket: Socket}) => {

	const { state } = useChat();
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
	const getMessages = async () => {
		
		try {
			const response = await fetch (`http://localhost:3001/chat/getMessages/${state.currentConversationID}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				}
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

		socketInUse.on('userJoinedRoom', (notification: string) => {
			console.log("Channel event: ", notification);
		});

		socketInUse.on('onMessage', (message: Message) => {
			if (message)
				setMessages((prevMessages: Message[]) => [...prevMessages, message]);
		});

		return () => {
			socketInUse.off('onMessage')
			socketInUse.off('userJoinedRoom');
		}
	}, [socketInUse]);
	
	// Loading the conversation (retrieving all messages on component rendering)
	useEffect(() => {
		console.log("Loading conversation...");
		getMessages();
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	return (
		<div ref={messagesContainerRef} className="bloc-channel-chat">
			{messages.map((message: Message, id: number) => (
				<>
					<div key={id} className={`message-container ${isMyMessage(message) ? 'my-message' : 'other-message'}`}>
						<p className="channel-chat-content">{message.content}</p>
						<p className="channel-chat-date">{formatDateTime(message.post_datetime)}</p>
					</div>
				</>
			))}
		</div>
	)
};
export default ReceiveBoxChannelComponent;