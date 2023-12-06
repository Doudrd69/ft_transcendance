import './ChatList.css';
import React, { useState, useEffect } from 'react';
import {useChat} from '../../../ChatContext';

interface Conversation {
	name: string;
}

const ChatListComponent: React.FC = () => {

	// const retreiveUser = async () => {
	// 	const response = await fetch("http://localhost:3001/getUser", {
	// 		method : 'GET',
	// 		headers:{
	// 			'Authorization':,
	// 		},
	// 	});
	// }
	// if (response.ok){
	// 	const userData = await Response.json();
	// 	userData.login();
	// }
	const { state, dispatch } = useChat();

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const user = sessionStorage.getItem("currentUserLogin");

	const loadDiscussions = async () => {

		const response = await fetch(`http://localhost:3001/chat/getConversations/${user}`, {
			method: 'GET',
		});

		if (response.ok) {
			const userData = await response.json();
			console.log("Raw userData: ", userData);
			setConversations((prevConversations: Conversation[]) => [...prevConversations, ...userData]);
			console.log(conversations);
		}
		else {
			console.log("Fatal error");
		}
	};

	const userData = {
		discussion: [
			"Eowyn Percetcheveux",
			"Edouard Brodeur",
			"Zoe Roffi",
			"Frederic Monachon",
			"Jean du Jardinage",
			"Xavier Ni elle ni moi",
			"WiNi Monachon"
		],
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
			{userData.discussion.map((user, index) => (
			<div className = "bloc-button-discussion-list">
				<div className={`profil-discussion-list ${userData.online[index]}`}/>
				<button	className="discussion-list" 
						onClick={() => dispatch({ type: 'TOGGLE', payload: 'showChat' })}>
					{user}
				</button>
			</div>
			))}
		</div>
	)
};
export default ChatListComponent;