import './ChatList.css';
import React, { useState, useEffect } from 'react';
import {useChat} from '../../../ChatContext';
import AddConversationComponent from '../../addConversation/AddConversation';
import { Socket } from 'socket.io-client';
import AvatarImageComponent from '@/app/components/Avatar/Avatar';
import AvatarImageBisComponent from '@/app/components/Avatar/AvatarBis';

interface ChannelListComponentProps {
	userSocket: Socket; // Assurez-vous d'avoir la bonne importation pour le type Socketg;
}

interface FriendShip {
	id: number;
	isAccepted: true;
	isActive: boolean;
	friend?: any;
	initiator?: any
	roomName?: string;
	roomID?: string;
}

interface Conversation {
	id: string,
	name: string;
	is_channel:boolean;
}

const ChatListComponent: React.FC<ChannelListComponentProps> = ({ userSocket }) => {

	const { state, dispatch } = useChat();
	const username = sessionStorage.getItem("currentUserLogin");
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [friendList, setFriendList] = useState<FriendShip[]>([]);
  
	const loadFriendList = async () => {

		const response = await fetch(`http://localhost:3001/users/getFriends/${username}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			}
		});
		
		if (response.ok) {
			const friends = await response.json();

			const requestDms = await fetch(`http://localhost:3001/chat/getConversations/${sessionStorage.getItem("currentUserID")}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
			});

			if (requestDms.ok) {
				const conversations = await requestDms.json();
				const DMs = conversations.filter((conversation: Conversation) => !conversation.is_channel);

				friends.forEach((friend: FriendShip) => {
					DMs.forEach((dm: Conversation) => {
						friend.roomName = dm.name;
						friend.roomID = dm.id;
					});
				});
				setFriendList([...friends]);
			}
		}
		else {
			console.log("Fatal error");
		}
	}

	useEffect(() => {
		console.log("Loading friend list...");
		loadFriendList();
	}, [state.refreshFriendList]);
	const timestamp = new Date().getTime();
	return (
		<div className="bloc-discussion-list">
			{friendList.map((friend: FriendShip, id: number) => (
				<div key={friend.id} className="bloc-button-discussion-list">
				<img
						src={`http://localhost:3001/users/getAvatarByLogin/${friend.friend ? friend.friend.login : friend.initiator ? friend.initiator.login : 'Unknown User'}/${timestamp}`}
					className={`profil-discussion-list ${friend.isActive ? 'on' : 'off'}`}
					alt="User Avatar"
					/>
			  		<div className={`amies ${activeIndex === id ? 'active' : ''}`} onClick={() => {
        					dispatch({ type: 'TOGGLE', payload: 'showChat' });
        					dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: friend.friend ? friend.friend.login : friend.initiator ? friend.initiator.login : 'Unknown User'});
							dispatch({ type: 'SET_CURRENT_ROOM', payload: friend.roomName});
        					dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: friend.roomID});
						}}>
						{friend.friend ? friend.friend.login : friend.initiator ? friend.initiator.login : 'Unknown User'}
					</div>
				</div>
			))}
		</div>
	); 
};
export default ChatListComponent;