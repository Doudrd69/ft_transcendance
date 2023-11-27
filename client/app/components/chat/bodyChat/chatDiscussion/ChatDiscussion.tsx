import './ReceiveBox.css'
import React, { useState , useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client'
import { useChat } from '../../ChatContext';

interface Message {
	from: string;
	content: string;
	post_datetime: string;
	conversationName: string;
}

const ReceiveBoxComponent = (socket: {socket: Socket}) => {

<<<<<<< HEAD
<<<<<<< HEAD
	const { state } = useChat();
	// const conversationName = state.currentConversation;
=======
=======
	
	const conversationName = "test2";
	const socketInUse = socket.socket;
	const [messages, setMessages] = useState<Message[]>([]);
	
	const isMyMessage = (message: Message): boolean => {
		return message.from === sessionStorage.getItem("currentUserLogin");
	};
	
>>>>>>> c667de6 (A little css done in chat, but it works with different users)
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

<<<<<<< HEAD
	const conversationName = "test2";
>>>>>>> 0ca604f (Display fixed)
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

	const isMyMessage = (message: Message): boolean => {
		return message.from === "ebrodeur";
	};

=======
>>>>>>> c667de6 (A little css done in chat, but it works with different users)
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
<<<<<<< HEAD

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
=======

	return (
		<div className="bloc-discussion-chat">
			<p className="discussion-chat">{newMessage}</p>
			{messages.map((message: Message) => (
				<>
				    <div className={`message-container ${isMyMessage(message) ? 'my-message' : 'other-message'}`}>
						<p className="discussion-chat-content">{message.content}</p>
						<p className="discussion-chat-date">{formatDateTime(message.post_datetime)}</p>
					</div>
				</>
<<<<<<< HEAD
		))}
>>>>>>> cf752e9 (Trying to retreive messages from conversation and display them)
		</div>
	)
};
export default ReceiveBoxComponent;
=======
			))}
		</div>
	)
};
export default ChatDiscussionComponent;

// On affiche d'abord l'historique des messages
// Ensuite on affiche le dernier message envoye grace a la bdd
// On envoie le nouveau message en direct grace au socket
>>>>>>> 6d405b8 (UPDATE: we have the beginning of a worcking chat)
