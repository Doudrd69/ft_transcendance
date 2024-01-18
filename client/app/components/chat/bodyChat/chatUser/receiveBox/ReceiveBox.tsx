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
}

const ReceiveBoxComponent: React.FC = () => {

	const { state } = useChat();
	const { globalState } = useGlobal()
	const [messages, setMessages] = useState<Message[]>([]);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	
	const isMyMessage = (message: Message): boolean => {
		return message.from === sessionStorage.getItem("currentUserLogin");
	};
	console.log("userList dans receive.tsx: ", state.currentUserList);
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

	const getMessage = async () => {

		try {
			console.log("Get conversation ", state.currentConversation.id);
			const response = await fetch(`http://localhost:3001/chat/getMessages/${state.currentConversation.id}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				}
			});
			if (response.ok) {
				
				const messageList = await response.json();
				console.log('message lIst', messageList)
				setMessages((prevMessages: Message[]) => [...prevMessages, ...messageList]);
			}
		} catch (error) {
			console.log(error);
		}
	}
	useEffect(() => {

		globalState.userSocket?.on('onMessage', (message: Message) => {
			if (message) {
				setMessages((prevMessages: Message[]) => [...prevMessages, message]);
			}
		});
		
		return () => {
			globalState.userSocket?.off('onMessage')
		}

	}, [globalState?.userSocket]);
	
	useEffect(() => {
		console.log("Loading DM conversation...");
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