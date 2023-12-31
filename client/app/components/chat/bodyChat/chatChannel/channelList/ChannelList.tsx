import './ChannelList.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../../ChatContext';
import AddConversationComponent from '../../addConversation/AddConversation';
import { Socket } from 'socket.io-client';

interface Conversation {
  id: string;
  name: string;
  is_channel: boolean;
}

interface ChanneListComponentProps {
	userSocket: Socket;
}

const ChannelListComponent: React.FC<ChanneListComponentProps> = ({ userSocket }) => {

	const { state, dispatch } = useChat();

	const userID = Number(sessionStorage.getItem("currentUserID"));
	const [conversations, setConversations] = useState<Conversation[]>([]);
	
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
			console.log("isAdmin ==> ", isAdmin);
			console.log("--> ", conversationList);
			if (conversationList)
				setConversations((prevConversations: Conversation[]) => [...prevConversations, ...conversationList]);
		}
		else {
			console.log("Fatal error");
		}
	};

	const userData = {
		discussion: conversations,
		online: ["on", "off", "on", "on", "off", "on", "on"],
	};

	useEffect(() => {
		console.log("Loading conversations...");
		loadDiscussions();
		console.log("convs --> ", conversations);
	}, [state.refreshChannel]);

	const parseName = (name: string): string => {

		const currentUserLogin = sessionStorage.getItem("currentUserLogin");
		const conversationNameWithoutCurrentUser = name.replace(currentUserLogin!, '').trim()
		const modifiedName = conversationNameWithoutCurrentUser.slice();
		return modifiedName;
	};

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
		{userData.discussion.map((conversation, index) => (
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
				<span>{parseName(conversation.name)}</span>
			</button>
			)
		))}
		</div>
	);
};

export default ChannelListComponent;