import './ChannelList.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../../ChatContext';
import AddConversationComponent from '../../addConversation/AddConversation';
import { Socket } from 'socket.io-client';
import ListMyChannelComponent from '../../listMyChannel/ListMyChannel';
import PasswordComponent from '../../listMyChannel/Password';
import { setCurrentComponent } from '../../../ChatContext';
import { useGlobal } from '@/app/GlobalContext';

interface Conversation {
	id: string;
	name: string;
	is_channel: boolean;
	isPublic: boolean;
	isProtected: boolean;
}
interface User {
	id: number;
	login: string;
	avatarURL: string;
	isAdmin: boolean;
	isMute: boolean;
	isBan: boolean;
	isOwner: boolean;
}

const ChannelListComponent: React.FC = () => {

	const { chatState, chatDispatch } = useChat();
	const { globalState } = useGlobal();

	const userID = Number(sessionStorage.getItem("currentUserID"));
	const userName = sessionStorage.getItem("currentUserLogin")

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [isAdmin, setIsAdmin] = useState<boolean[]>([]);
	const [userList, setUserList] = useState<User[][]>([]);
	

	const loadDiscussions = async () => {

		try{

			const response = await fetch(`http://localhost:3001/chat/getConversationsWithStatus/${userID}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				}
			});
	
			if (response.ok) {
				const responseData = await response.json();
				const { conversationList, isAdmin, usersList } = responseData;
				if (conversationList)
					setConversations([...conversationList]);
				if (isAdmin)
					setIsAdmin([...isAdmin]);
				if (usersList ) {
					setUserList([...usersList]);
					console.log(usersList);
				}	
			}
		}
		catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {

		globalState.userSocket?.on('userIsBan', () => {
			chatDispatch({ type: 'DISABLE', payload: 'showChannel' });
			chatDispatch({ type: 'ACTIVATE', payload: 'showChannelList' });
			loadDiscussions();
		});

		globalState.userSocket?.on('channelDeleted', ( data: {roomName: string, roomID: string} ) => {
			const { roomName, roomID } = data;
			loadDiscussions();
			globalState.userSocket?.emit('leaveRoom', { roomName: roomName, roomID: roomID });
			chatDispatch({ type: 'ACTIVATE', payload: 'showChannelList' });
		});

		globalState.userSocket?.on('userIsUnban', () => {
			loadDiscussions();
		});

		globalState.userSocket?.on('refreshChannelList', () => {
			console.log("REFRESHING USERLIST");
			loadDiscussions();
		});

		return () => {
			globalState.userSocket?.off('banUser');
			globalState.userSocket?.off('refreshChannelList');
			globalState.userSocket?.off('refreshChannel');
			globalState.userSocket?.off('channelDeleted');
		}

	}, [globalState?.userSocket]);

	useEffect(() => {
		loadDiscussions();

	}, [chatState.refreshChannel]);

	const handleCloseAddCreate = () => {
		chatDispatch({ type: 'DISABLE', payload: 'showAddCreateChannel' });
	};

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				handleCloseAddCreate();
			}
		};
		
		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('keydown', handleEscape);
			};
	}, []);

	const handleConv = (conversation: Conversation, user: User[], index: number) => {
		chatDispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
		chatDispatch(setCurrentComponent('showChannelList'));
		chatDispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });
		chatDispatch({ type: 'SET_CURRENT_CONVERSATION_IS_PRIVATE', payload: conversation.isPublic });
		chatDispatch({ type: 'SET_CURRENT_CONVERSATION_IS_PROTECTED', payload: conversation.isProtected });
		chatDispatch({ type: 'ACTIVATE', payload: 'currentChannelBool' });
		chatDispatch({ type: 'ACTIVATE', payload: 'dontcancel' });
		console.log("user", user);
		if(isAdmin[index])
		{
			chatDispatch({ type: 'ACTIVATE', payload: 'showAdmin' });
			chatDispatch({ type: 'ACTIVATE', payload: 'isAdmin' });
		}
		const me = user.filter((user: User) => user.login === sessionStorage.getItem("currentUserLogin"));
		console.log("me", me);
		console.log("m2", me[0].isOwner);

		if(me[0].isOwner)
			chatDispatch({ type: 'ACTIVATE', payload: 'isOwner' });
		
		chatDispatch({ type: 'DISABLE', payload: 'showChannelList' });
		chatDispatch({ type: 'ACTIVATE', payload: 'showChannel' });
	
	}

	return (
		<div className="bloc-channel-list">
			<button
				className={`button-channel-list-add ${chatState.showAddCreateChannel ? 'green-border' : ''}`}
				onClick={() => {
				chatDispatch({ type: 'ACTIVATE', payload: 'showAddCreateChannel' });
				}}
			>
				+
			</button>
			<div className='create-add'>
				{ chatState.showAddCreateChannel ?
					<div className='blur'>
						<img className="add_button_cancel" src='./close.png'  onClick={handleCloseAddCreate}/>
						<div className='bloc-add-create'>
							<button className='button-add' onClick= {() => {chatDispatch({type:'ACTIVATE', payload: 'showCreateChannel'})}}>
								CREATE
							</button>
							<button className='button-add' onClick= {() => {chatDispatch({type:'ACTIVATE', payload: 'showAddChannel'})}}>
								JOIN 
							</button>
						</div>
					</div>
					: null}
				{chatState.showPassword ? <PasswordComponent /> : null}
				{chatState.showAddChannel ? <ListMyChannelComponent user={userName || 'no-user'} isAdd={true} title="JOIN CHANNEL"/> : null}
				{chatState.showCreateChannel ? <AddConversationComponent loadDiscussions={loadDiscussions} title="CREATE CHANNEL" isChannel={true} /> : null}
			</div>
			{conversations.map((conversation, index) => (
					conversation.is_channel && (
					<button
					key={index}
					className="button-channel-list"
					onClick={() => {
							handleConv(conversation, userList[index], index);
							if(isAdmin[index])
								chatState.currentIsAdmin = true;
						}}>
					{isAdmin[index] && <img className="icon-admin-channel" src='./crown.png' alt="private" />}
					{conversation.isProtected &&  <img className="icon-password-channel" src='./password.png' alt="private" />}
					{!conversation.isPublic && <img className="icon-private-channel" src='./private.png' alt="private" />}
					<span>{`${conversation.name}#${conversation.id}`}</span>
				</button>
				)
			))}
		</div>
	);
};

export default ChannelListComponent;
