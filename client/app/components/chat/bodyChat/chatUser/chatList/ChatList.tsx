import './ChatList.css';
import React, { useState, useEffect } from 'react';
import {useChat} from '../../../ChatContext';

interface Conversation {
	id: number,
	name: string;
	is_channel:boolean;
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
			setConversations((prevConversations: Conversation[]) => [...prevConversations, ...userData]);
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
	console.log("conversations ============================================== ");
	console.log(conversations);

	useEffect(() => {
		console.log("Loading converssations...");
		loadDiscussions();
	}, []);
	return (
		<div className="bloc-discussion-list">
			{userData.discussion.map((conversation, index) => (
				!conversation.is_channel && (
						<div key={index} className="bloc-button-discussion-list">
							<div className={`profil-discussion-list ${userData.online[index]}`} />
								<button className="discussion-list" onClick={() => dispatch({ type: 'TOGGLE', payload: 'showChat'})}>
									<span>{conversation.name}</span>
								</button>
						</div>
				)
			))}
		</div>
	)
};
export default ChatListComponent;