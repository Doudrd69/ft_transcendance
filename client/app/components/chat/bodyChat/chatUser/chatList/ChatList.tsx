import './ChatList.css';
import React, { useState, useEffect } from 'react';
import {setDmList, useChat} from '../../../ChatContext';
import AddConversationComponent from '../../addConversation/AddConversation';
import { Socket } from 'socket.io-client';
import AvatarImageComponent from '@/app/components/Avatar/Avatar';
import AvatarImageBisComponent from '@/app/components/Avatar/AvatarBis';
import { setCurrentComponent, setTargetUser } from '../../../ChatContext';
import { DM_Mono } from 'next/font/google';


interface Dm {
	conversationId: number;
	username: string;
	avatarURL: string;
}

interface TargetUser {
	id: number;
	username: string;
	avatarURL: string;
}

const ChatListComponent: React.FC = () => {

	const { state, dispatch } = useChat();
	const username = sessionStorage.getItem("currentUserLogin");


	const loadDms = async () => {
		console.log("ahahahahahahah");
		try {
			const requestDms = await fetch(`http://localhost:3001/chat/getDMsConversations/${sessionStorage.getItem("currentUserID")}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
			});
	
			if (requestDms.ok) {
				const dms = await requestDms.json();
				dispatch(setDmList(dms));
				console.log("DMs: ", dms);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		console.log("Loading friend list...");
		loadDms();
	},[]);

	const handleConversation = (dm: Dm): React.MouseEventHandler<HTMLDivElement> => {
		return (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			// dispatch(setTargetUser(userTarget));
			dispatch({ type: 'DISABLE', payload: 'showChatList' });
			dispatch({ type: 'ACTIVATE', payload: 'showChat' });
			dispatch(setCurrentComponent('showChatList'));
		};
	}
	useEffect(() => {
		console.log("Loading friend list...");
		loadDms();
	}, [state.refreshFriendList]);

	const timestamp = new Date().getTime();

	return (
		null
		// <div className="bloc-discussion-list">
		// 	{state.dmList && state.dmList?.map((dm: Dm, id: number) => (
		// 		<div key={dm.id} className="bloc-button-discussion-list">
		// 		<img
		// 			src={`http://localhost:3001/users/getAvatarByLogin/${dm.username}?${timestamp}`}
		// 			className={`profil-discussion-list`}
		// 			alt="User Avatar"
		// 			/>
		// 	  		<div className="amies" onClick={handleConversation(dm)}>
		// 				{dm.username}
		// 			</div>
		// 		</div>
		// 	))}
		// </div>
	); 
};
export default ChatListComponent;