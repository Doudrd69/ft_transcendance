import './ChannelList.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../../ChatContext';

interface Conversation {
  id: string;
  name: string;
  is_channel: boolean;
}

const ChannelListComponent: React.FC = () => {

	const { state, dispatch } = useChat();

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const user = sessionStorage.getItem("currentUserID");

	const loadDiscussions = async () => {

		const response = await fetch(`http://localhost:3001/chat/getConversationsWithStatus/${user}`, {
			method: 'GET',
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
		online: ["on", "off", "on", "on", "off", "on", "on"],
	};

	useEffect(() => {
		console.log("Loading conversations...");
		loadDiscussions();
	}, []);

	return (
		<div className="bloc-channel-list">
			{userData.discussion.map((conversation: Conversation, index: number) => (
			conversation.is_channel && (
			<button key={index} className="button-channel-list" onClick={() => {
					dispatch({ type: 'TOGGLE', payload: 'showChannel' });
					dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
					dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });
		  		}}>
				<span>{conversation.name}</span>
		  	</button>
			)
	  	))}
		</div>
  	);
};

export default ChannelListComponent;
