import './ChatList.css';
import React, { useState, useEffect } from 'react';
import {useChat} from '../../../ChatContext';
import AddConversationComponent from '../../addConversation/AddConversation';
import { Socket } from 'socket.io-client';

interface ChannelListComponentProps {
	socket: Socket; // Assurez-vous d'avoir la bonne importation pour le type Socket
  }

interface Conversation {
	id: string,
	name: string;
	is_channel:boolean;
}

const ChatListComponent: React.FC<ChannelListComponentProps> = ({ socket }) => {

	const { state, dispatch } = useChat();
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const user = Number(sessionStorage.getItem("currentUserID"));

	const updateConversations = async () => {
		const response = await fetch(`http://localhost:3001/chat/getConversations/${user}`, {
		method: 'GET',
		});
	
		if (response.ok) {
		const userData = await response.json();
		setConversations(userData);
	} else {
		console.log("Fatal error");
	}
	};
	useEffect(() => {
		updateConversations();
	}, []);
	
	const loadDiscussions = async () => {

		const response = await fetch(`http://localhost:3001/chat/getConversationsWithStatus/${user}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			}
		});

		if (response.ok) {
			const conversationsData = await response.json();
			const { conversations, isAdmin } = conversationsData;
			console.log("==> ", isAdmin);

			setConversations((prevConversations: Conversation[]) => [...prevConversations, ...conversations]);
		} 
		else {
			console.log("Fatal error");
		}
	};

	const userData = {
		discussion: conversations,
		online:["on", "off", "on", "on", "off", "on", "on"],
	}

	useEffect(() => {
		console.log("Loading DMs...");
		loadDiscussions();
	}, []);

	return (
		<div className="bloc-discussion-list">
			<button
				className="button-discussion-list-add"
				onClick={() => {
				dispatch({ type: 'ACTIVATE', payload: 'showAddUser' });
			}}
			>
			+
			</button>
			{state.showAddUser && <AddConversationComponent socket={socket} updateConversations={updateConversations} title="Add/Create Conversation" isChannel={false}/>}
			{userData.discussion.map((conversation, index) => (
				!conversation.is_channel && (
					<div key={index} className="bloc-button-discussion-list">
						<div className={`profil-discussion-list ${userData.online[index]}`} />
							<button key={index} className="button-discussion-list" onClick={() => {
								dispatch({ type: 'TOGGLE', payload: 'showChat' });
								dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
								dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });
		  					}}>
								<span>{conversation.name}</span>
							</button>
					</div>
				)
			))}
		</div>
	)
};
export default ChatListComponent;