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

interface FriendShip {
	id: number;
	isAccepted: true;
	isActive: boolean;
	friend?: any;
	initiator?: any
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
	const username = sessionStorage.getItem("currentUserLogin");
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const timestamp = new Date().getTime();
	const [friendList, setFriendList] = useState<FriendShip[]>([]);


	const loadFriendList = async () => {
		setFriendList([]);
		const response = await fetch(`http://localhost:3001/users/getFriends/${username}`, {
			method: 'GET',
		});
		
		if (response.ok) {
			const data = await response.json();
			setFriendList([...data]);
		}
		else {
			console.log("Fatal error: no friend list");
		}
	}

	useEffect(() => {
		console.log("Loading friend list...");
		loadFriendList();
	}, [state.refreshFriendList]);

	  return (
		<div className="bloc-discussion-list">
		  {friendList.map((friend: FriendShip, id: number) => (
			<div key={friend.id} className="bloc-button-discussion-list">
			  <img src={`http://localhost:3001${friend.friend.avatarURL}`} className={`profil-discussion-list ${friend.isActive ? 'on' : 'off'}`} alt="User Avatar" />
			  <div className={`amies ${activeIndex === id ? 'active' : ''}`} onClick={() => {
				console.log("Avatar URL:", `http://localhost:3001${friend.friend.avatarURL}`);
				dispatch({ type: 'TOGGLE', payload: 'showChat' });
				dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: friend.friend.login || friend.initiator.login || 'Unknown User' });
				dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: friend.friend.id || friend.initiator.id || -1 });
			  }}>
				{friend.friend ? friend.friend.login : friend.initiator ? friend.initiator.login : 'Unknown User'}
			  </div>
			</div>
		  ))}
		</div>
	  );
	  
};
export default ChatListComponent;