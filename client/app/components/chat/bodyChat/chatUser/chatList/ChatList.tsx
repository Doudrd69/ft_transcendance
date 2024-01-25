import './ChatList.css';
import React, { useState, useEffect } from 'react';
import {useChat} from '../../../ChatContext';
import AddConversationComponent from '../../addConversation/AddConversation';
import { Socket } from 'socket.io-client';
import AvatarImageComponent from '@/app/components/Avatar/Avatar';
import AvatarImageBisComponent from '@/app/components/Avatar/AvatarBis';
import { setCurrentComponent } from '../../../ChatContext';
import { useGlobal } from '@/app/GlobalContext';



interface Conversation {
	id: number,
	username: string;
	avatarURL: string;
	name: string;
}

const ChatListComponent: React.FC = () => {

	const { chatState, chatDispatch } = useChat();
	const { globalState } = useGlobal();
	const username = sessionStorage.getItem("currentUserLogin");
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [dm, setDm] = useState<Conversation[]>([]);
  
	const loadDMs = async () => {

		try {
			const requestDms = await fetch(`http://localhost:3001/chat/getDMsConversations/${sessionStorage.getItem("currentUserID")}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
			});

			if (requestDms.ok) {
				const dmResult = await requestDms.json();
				setDm([...dmResult]);
			}
	}
		catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {

		globalState.userSocket?.on('refreshDmList', () => {
			console.log("Loading DMs...");
			loadDMs();
		});

		return () => {
			globalState.userSocket?.off('refreshDmList');
		}

	}, [globalState?.userSocket]);

	useEffect(() => {
		console.log("Loading DMs...");
		loadDMs();
	}, [state.refreshFriendList]);

	const timestamp = new Date().getTime();

	return (
		<div className="bloc-discussion-list">
			{dm.map((dm: Conversation, id: number) => (
				<div key={dm.id} className="bloc-button-discussion-list">
				<img
						src={`http://localhost:3001/users/getAvatarByLogin/${dm.username}/${timestamp}`}
					className={`profil-discussion-list`}
					alt="User Avatar"
					/>
			  		<div className={`amies ${activeIndex === id ? 'active' : ''}`} onClick={() => {
						  dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: dm.username});
						  dispatch({ type: 'SET_CURRENT_ROOM', payload: dm.name});
						  dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: dm.id});
						  dispatch({ type: 'DISABLE', payload: 'showChatList' });
						  dispatch({ type: 'ACTIVATE', payload: 'showChat' });
						  dispatch(setCurrentComponent('showChatList'));

						}}>
						{dm.username}
					</div>
				</div>
			))}
		</div>
	); 
};
export default ChatListComponent;