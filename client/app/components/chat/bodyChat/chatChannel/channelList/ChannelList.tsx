import './ChannelList.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../../ChatContext';
import AddConversationComponent from '../../addConversation/AddConversation';
import { Socket } from 'socket.io-client';

interface Conversation {
	id: string;
	name: string;
	is_channel: boolean;
	isPublic: boolean;
}

interface ChanneListComponentProps {
	userSocket: Socket;
}

const ChannelListComponent: React.FC<ChanneListComponentProps> = ({ userSocket }) => {

	const { state, dispatch } = useChat();

	const userID = Number(sessionStorage.getItem("currentUserID"));
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [isAdmin, setIsAdmin] = useState<boolean[]>([]);	
	
	const loadDiscussions = async () => {

		const response = await fetch(`http://localhost:3001/chat/getConversationsWithStatus/${userID}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			}
		});

		if (response.ok) {
			const responseData = await response.json();
			const { conversationList, isAdmin } = responseData;
			if (conversationList)
				setConversations([...conversationList]);
			if (isAdmin)
				setIsAdmin([...isAdmin]);
			console.log("conversation --> ", conversationList);
		}
		else {
			console.log("Fatal error");
		}
	};


	useEffect(() => {
		console.log("Loading conversations...");
		loadDiscussions();

	}, [state.refreshChannel]);

	return (
		<div className="bloc-channel-list">
		<button
			className={`button-channel-list-add ${state.showAddChannel ? 'green-border' : ''}`}
			onClick={() => {
			dispatch({ type: 'ACTIVATE', payload: 'showAddChannel' });
			}}
		>
			+
		</button>
		{state.showAddChannel && <AddConversationComponent userSocket={userSocket} loadDiscussions={loadDiscussions} title="Add/Create Channel" isChannel={true}/>}
		{conversations.map((conversation, index) => (
				conversation.is_channel && (
				<button
				key={index}
				className="button-channel-list"
				onClick={() => {
					dispatch({ type: 'TOGGLE', payload: 'showChannel' });
					dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
					dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });
					dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });
				}}
				>
				 {isAdmin[index] && <img className="icon-admin-channel" src='./crown.png' alt="private" />}
				{!conversation.isPublic && <img className="icon-private-channel" src='./padlock.png' alt="private" />}
				<span>{conversation.name}</span>
			</button>
			)
		))}
		</div>
	);
};

export default ChannelListComponent;