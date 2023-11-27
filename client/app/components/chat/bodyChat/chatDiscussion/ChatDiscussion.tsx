import './ChatDiscussion.css'
import React, { useState , useEffect } from 'react';
import { Socket } from 'socket.io-client'

interface Message {
	from: string;
	content: string;
<<<<<<< HEAD
	date: string;
=======
	post_datetime: string;
	conversationName: string;
>>>>>>> 61b0433 (Display fixed)
}

const ChatDiscussionComponent = (socket: {socket: Socket}) => {

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
	const socketInUse = socket.socket;
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");


	socketInUse.on('onMessage', (message: Message) => {
		console.log("Received message from gateway: ", message.content);
		setNewMessage(message.content);

		getMessage();
	});

<<<<<<< HEAD
=======
	const isMyMessage = (message: Message): boolean => {
		return message.from === "ebrodeur";
	};

	// This function will retreive all the messages from the conversation and set the messages array for display
>>>>>>> 61b0433 (Display fixed)
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

<<<<<<< HEAD
=======
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

>>>>>>> 61b0433 (Display fixed)
	return (
		<div className="bloc-discussion-chat">
			<p className="discussion-chat">{newMessage}</p>
			{messages.map((message: Message) => (
				<>
					<p className="discussion-chat-content">{message.content}</p>
					<p className="discussion-chat-date">{formatDateTime(message.post_datetime)}</p>
				</>
			))}
		</div>
	)
};
export default ChatDiscussionComponent;

// On affiche d'abord l'historique des messages
// Ensuite on affiche le dernier message envoye grace a la bdd
// On envoie le nouveau message en direct grace au socket