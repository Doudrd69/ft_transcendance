import './ChatList.css';
import React, { useState, useEffect } from 'react';
import {useChat} from '../../../ChatContext';
import AddConversationComponent from '../../addConversation/AddConversation';
import { Socket } from 'socket.io-client';
import { setCurrentComponent } from '../../../ChatContext';
import { useGlobal } from '@/app/GlobalContext';
import { toast } from 'react-toastify';



interface Conversation {
	id: number,
	username: string;
	avatarURL: string;
	name: string;
	onlineStatus: boolean;
}

const ChatListComponent: React.FC = () => {

	const { chatState, chatDispatch } = useChat();
	const { globalState } = useGlobal();
	const username = sessionStorage.getItem("currentUserLogin");
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [dm, setDm] = useState<Conversation[]>([]);
  
	const loadDMs = async () => {
		try {
			const requestDms = await fetch(`${process.env.API_URL}/chat/getDMsConversations`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
			});

			if (requestDms.ok) {
				const dmResult = await requestDms.json();
				setDm([...dmResult]);
			}
			else {
				const error = await requestDms.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
	}
		catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {

		globalState.userSocket?.on('refreshDmList', () => {
			loadDMs();
		});
		
		globalState.userSocket?.on('newConnection', (notif: string) => {
			loadDMs();
		})

		globalState.userSocket?.on('newDeconnection', (notif: string) => {
			loadDMs();
		})

		return () => {
			globalState.userSocket?.off('refreshDmList');
			globalState.userSocket?.off('newConnection');
			globalState.userSocket?.off('newDeconnection');
		}

	}, [globalState?.userSocket]);

	useEffect(() => {
		loadDMs();
	}, [chatState.refreshFriendList]);

	const timestamp = new Date().getTime();

	return (
		<div className="bloc-discussion-list">
			{dm.map((dm: Conversation, id: number) => (
				<div key={dm.id} className="bloc-button-discussion-list">
				<img
						src={`${process.env.API_URL}/users/getAvatar/${dm.id}/${timestamp}`}
					className={`profil-discussion-list`}
					alt="User Avatar"
					/>
			  		<div className={`amies ${activeIndex === id ? 'active' : ''}`} onClick={() => {
						chatDispatch({ type: 'SET_CURRENT_CONVERSATION', payload: dm.username});
						chatDispatch({ type: 'SET_CURRENT_ROOM', payload: dm.name});
						chatDispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: dm.id});
						chatDispatch({ type: 'DISABLE', payload: 'showChatList' });
						chatDispatch({ type: 'ACTIVATE', payload: 'showChat' });
						chatDispatch(setCurrentComponent('showChatList'));
						}}>
						{dm.onlineStatus ? 
							<div className="online" />
							:
							<div className="offline" />
						}
						{dm.username}
					</div>
				</div>
			))}
		</div>
	); 
};
export default ChatListComponent;