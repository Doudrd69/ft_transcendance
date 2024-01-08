import './ChatList.css';
import React, { useState, useEffect } from 'react';
import {useChat} from '../../../ChatContext';
import AddConversationComponent from '../../addConversation/AddConversation';
import { Socket } from 'socket.io-client';
import AvatarImageComponent from '@/app/components/Avatar/Avatar';
import AvatarImageBisComponent from '@/app/components/Avatar/AvatarBis';

interface ChannelListComponentProps {
	userSocket: Socket; // Assurez-vous d'avoir la bonne importation pour le type Socket
}

interface Conversation {
	id: string,
	name: string;
	is_channel:boolean;
}

const ChatListComponent: React.FC<ChannelListComponentProps> = ({ userSocket }) => {

	const { state, dispatch } = useChat();
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const user = Number(sessionStorage.getItem("currentUserID"));
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const timestamp = new Date().getTime();

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

	const parseName = (name: string): string => {
		const currentUserLogin = sessionStorage.getItem("currentUserLogin");
		const conversationNameWithoutCurrentUser = currentUserLogin
		  ? name.replace(currentUserLogin!, '').trim()
		  : '';
		const modifiedName = conversationNameWithoutCurrentUser.slice();
		
		return modifiedName;
	  };

	const addHashAtEnd = (conversation: Conversation): string => {
		const conversationName = conversation.name;
		// console.log("conversationName", conversationName);
		if (conversation.is_channel)
			return conversationName + "#";
		else
		{
			console.log("conversationName", conversationName);
			return conversationName;
		}
	};

	return (
		<div className="bloc-discussion-list">
			{userData.discussion.map((conversation, index) => (
				!conversation.is_channel && (
					<div key={index} className="bloc-button-discussion-list" >
						{/* console.log("conversation ????????????????", conversation.name) */}
						<AvatarImageComponent className={`profil-discussion-list ${userData.online[index]}`} refresh={true} name={parseName(conversation.name)}/>
							<div className={`amies ${activeIndex === index ? 'active' : ''}`} key={index}  onClick={() => {
								dispatch({ type: 'TOGGLE', payload: 'showChat' });
								dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name});
								dispatch({ type: 'SET_CURRENT_CONVERSATION_NAME', payload: addHashAtEnd(conversation)});
								dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });}}>
									<span>{parseName(conversation.name)}</span>
							</div>
					</div>
				)
			))}
		</div>
	)
};
export default ChatListComponent;