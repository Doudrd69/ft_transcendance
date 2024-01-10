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
				setConversations((prevConversations: Conversation[]) => [...prevConversations, ...conversationList]);
		}
		else {
			console.log("Fatal error");
		}
	};
	
	useEffect(() => {
		console.log("Loading conversations...");
		loadDiscussions();
		console.log("convs --> ", conversations);
	}, [state.refreshChannel]);

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
			const conversation = await response.json();
			if (userSocket.connected) {
				userSocket.emit('addUserToRoom', { convID: conversation.id, convName: conversation.name, friend: user } );
			}
			console.log("Friend has been successfully added!");
			dispatch({ type: 'TOGGLE', payload: 'listChannelAdd' });
		}
		else {
			console.log("Fatal error");
		}
	}

	const handleCloseList = () => {
		dispatch({ type: 'DISABLE', payload: 'showListChannelAdd' });
	};

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				handleCloseList();
			}
		};
		
			document.addEventListener('keydown', handleEscape);
			return () => {
			  document.removeEventListener('keydown', handleEscape);
			};
		  }, []);

	return (
		<div className='blur-background'>
			<img className="add_button_cancel" src='./close.png'  onClick={handleCloseList}/>
			<div className='juste-pour-englober'>
				<p className="title-list-channel-component">CHOOSE IN YOUR SERVER</p>
					<div className="bloc-add-channel-list">
						{conversations.map((conversation, index) => (
							conversation.is_channel && (
							<button
								key={index}
								className="button-add-channel-list"
								onClick={() => {
									addFriendToConversation(Number(conversation.id), user);}}>
								<span>{conversation.name}</span>
							</button>
						)))}
					</div>
			</div>
		</div>
	);
};
export default ListMyChannelComponent;