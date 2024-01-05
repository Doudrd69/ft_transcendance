import './ListMyChannel.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../ChatContext';
import { Socket } from 'socket.io-client';

interface ListMyChannelComponentProps {
	userSocket: Socket; // Assurez-vous d'avoir la bonne importation pour le type Socket
	user: string;
}

interface Conversation {
	id: number;
	name: string;
	is_channel: boolean;
}

const ListMyChannelComponent: React.FC<ListMyChannelComponentProps> = ({ userSocket, user }) => {

	const { state, dispatch } = useChat();
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const userID = sessionStorage.getItem("currentUserID");

	const loadDiscussions = async () => {

		const response = await fetch(`http://localhost:3001/chat/getConversations/${userID}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
			}
		});

		if (response.ok) {
			const userData = await response.json();
			setConversations(userData);
		} else {
			console.log("Fatal error");
		}
	};

	const addFriendToConversation = async (convID: number, friend: string) => {

		const addFriendToConversationDto = {
			userToAdd: friend,
			conversationID: convID,
		}

		console.log(addFriendToConversationDto);

		const response = await fetch('http://localhost:3001/chat/addFriendToConversation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
			},
			body: JSON.stringify(addFriendToConversationDto),
		});

		if (response.ok) {
			console.log("Friend has been successfully added!");
		}
		else {
			console.log("Fatal error");
		}
	}

	useEffect(() => {
		loadDiscussions();
	}, []);

	const userData = {
		discussion: conversations,
		online: ["on", "off", "on", "on", "off", "on", "on"],
	};

	const handleCloseList = () => {
    	dispatch({ type: 'DISABLE', payload: 'showListChannelAdd' });
  	};

	return (
		<div className='blur-background'>
			<div className='juste-pour-englober'>
				<button className="close-button" onClick={handleCloseList}>
				&#10006;
				</button>
				<p className="title-list-channel-component">CHOOSE IN YOUR SERVER</p>
					<div className="bloc-add-channel-list">
						{userData.discussion.map((conversation, index) => (
							conversation.is_channel && (
							<button
								key={index}
								className="button-add-channel-list"
								onClick={() => {addFriendToConversation(Number(conversation.id), user)}}
								// onClick={() => {
								// FONCTION POUR AJOUTER LE USER A LA CONVERSATION
								// dispatch({ type: 'TOGGLE', payload: 'showChannel' });
								// dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
								// }}
							>
								<span>{conversation.name}</span>
							</button>
							)
						))}
					</div>
			</div>
		</div>
	);
};

export default ListMyChannelComponent;