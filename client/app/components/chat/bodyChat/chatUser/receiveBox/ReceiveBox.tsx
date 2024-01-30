import './ReceiveBox.css'
import React, { useState , useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client'
import { useChat } from '../../../ChatContext';
import { useGlobal } from '@/app/GlobalContext';

interface Message {
	from: string;
	content: string;
	post_datetime: string;
	conversationName: string;
	conversationID?: number;
	senderId: number;
}

const ReceiveBoxComponent: React.FC = () => {
	console.log("ReceiveBoxComponent");
	const { chatState } = useChat();
	const { globalState } = useGlobal()
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
			const response = await fetch(`${process.env.API_URL}/chat/getMessages/${chatState.currentConversationID}`, {
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

		globalState.userSocket?.on('onMessage', (message: Message) => {
			if (message && (message.conversationID == chatState.currentConversationID)) {
				setMessages((prevMessages: Message[]) => [...prevMessages, message]);
			}
		});
		
		return () => {
			globalState.userSocket?.off('onMessage')
		}

	}, [globalState?.userSocket]);
	
	// Loading the conversation (retrieving all messages on component rendering)
	useEffect(() => {
		getMessage();
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	return (
		<div ref={messagesContainerRef} className="bloc-discussion-chat">
			{messages.map((message: Message, index: number) => (
			<div key={index} className={`message-container ${isMyMessage(message) ? 'my-message' : 'other-message'}`}>
				<p className="discussion-chat-content">{message.content}</p>
				<p className="discussion-chat-date">{formatDateTime(message.post_datetime)}</p>
			</div>
			))}
		</div>
	);
};
export default ReceiveBoxComponent;