import './ChatList.css';
import React, { useState, useEffect } from 'react';
import {useChat} from '../../../ChatContext';

interface Conversation {
	id: number,
	name: string;
}

const ChatListComponent: React.FC = () => {

	const { state, dispatch } = useChat();

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const user = sessionStorage.getItem("currentUserLogin");

	const loadDiscussions = async () => {

		const response = await fetch(`http://localhost:3001/chat/getConversations/${user}`, {
			method: 'GET',
		});

		if (response.ok) {
			const userData = await response.json();
			console.log("DM (groups) : ", userData);
			setConversations((prevConversations: Conversation[]) => [...prevConversations, ...userData]);
			console.log(conversations);
		}
		else {
			console.log("Fatal error");
		}
	};

	const userData = {
		discussion: conversations,
		online:[
			"on",
			"off",
			"on",
			"on",
			"off",
			"on",
			"on",
		]
	}

	useEffect(() => {
		console.log("Loading conversations...");
		loadDiscussions();
	}, []);

	return (
		<div className="bloc-discussion-list">
		{userData.discussion.map((conversations, index) => (
		  <div key={index} className="bloc-button-discussion-list">
			<div className={`profil-discussion-list ${userData.online[index]}`} />
			<button
			  className="discussion-list"
			  onClick={() => dispatch({ type: 'TOGGLE', payload: 'showChat' })}
			>
			  {conversations.name}
			</button>
		  </div>
		))}
	  </div>
	)
};
export default ChatListComponent;