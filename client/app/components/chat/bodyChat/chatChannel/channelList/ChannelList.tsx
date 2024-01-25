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

	const { state, dispatch } = useChat();
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
				}	
			}
		}
		catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {

		if (globalState?.userSocket) {
			console.log("OUAIS ON ETS LA");
			globalState.userSocket?.on('userIsBan', () => {
				dispatch({ type: 'DISABLE', payload: 'showChannel' });
				dispatch({ type: 'ACTIVATE', payload: 'showChannelList' });
				loadDiscussions();
			});
		}

		globalState.userSocket?.on('channelDeleted', ( data: {roomName: string, roomID: string} ) => {
			const { roomName, roomID } = data;
			loadDiscussions();
			globalState.userSocket?.emit('leaveRoom', { roomName: roomName, roomID: roomID });
			dispatch({ type: 'ACTIVATE', payload: 'showChannelList' });
		});

		globalState.userSocket?.on('userIsUnban', () => {
			loadDiscussions();
		});
		// seul event rfreshChannelList est ici donc besoin de rien
		globalState.userSocket?.on('refreshChannelList', () => {
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
		console.log("Loading conversations...");
		loadDiscussions();

	}, [state.refreshChannel]);

	const handleCloseAddCreate = () => {
		dispatch({ type: 'DISABLE', payload: 'showAddCreateChannel' });
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
		dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
		dispatch(setCurrentComponent('showChannelList'));
		dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });
		dispatch({ type: 'SET_CURRENT_CONVERSATION_IS_PRIVATE', payload: conversation.isPublic });
		dispatch({ type: 'SET_CURRENT_CONVERSATION_IS_PROTECTED', payload: conversation.isProtected });
		dispatch({ type: 'ACTIVATE', payload: 'currentChannelBool' });
		dispatch({ type: 'ACTIVATE', payload: 'dontcancel' });
		console.log("user", user);
		if(isAdmin[index])
		{
			dispatch({ type: 'ACTIVATE', payload: 'showAdmin' });
			dispatch({ type: 'ACTIVATE', payload: 'isAdmin' });
		}
		const me = user.filter((user: User) => user.login === sessionStorage.getItem("currentUserLogin"));
		console.log("me", me);
		console.log("m2", me[0].isOwner);

		if(me[0].isOwner)
			dispatch({ type: 'ACTIVATE', payload: 'isOwner' });
		
		dispatch({ type: 'DISABLE', payload: 'showChannelList' });
		dispatch({ type: 'ACTIVATE', payload: 'showChannel' });
	
	}

	return (
		<div className="bloc-channel-list">
			<button
				className={`button-channel-list-add ${state.showAddCreateChannel ? 'green-border' : ''}`}
				onClick={() => {
				dispatch({ type: 'ACTIVATE', payload: 'showAddCreateChannel' });
				}}
			>
				+
			</button>
			<div className='create-add'>
				{ state.showAddCreateChannel ?
					<div className='blur'>
						<img className="add_button_cancel" src='./close.png'  onClick={handleCloseAddCreate}/>
						<div className='bloc-add-create'>
							<button className='button-add' onClick= {() => {dispatch({type:'ACTIVATE', payload: 'showCreateChannel'})}}>
								CREATE
							</button>
							<button className='button-add' onClick= {() => {dispatch({type:'ACTIVATE', payload: 'showAddChannel'})}}>
								JOIN 
							</button>
						</div>
					</div>
					: null}
				{state.showPassword ? <PasswordComponent /> : null}
				{state.showAddChannel ? <ListMyChannelComponent user={userName || 'no-user'} isAdd={true} title="JOIN CHANNEL"/> : null}
				{state.showCreateChannel ? <AddConversationComponent loadDiscussions={loadDiscussions} title="CREATE CHANNEL" isChannel={true} /> : null}
			</div>
			{conversations.map((conversation, index) => (
					conversation.is_channel && (
					<button
					key={index}
					className="button-channel-list"
					onClick={() => {
							console.log("userList", userList);
							handleConv(conversation, userList[index], index);
							if(isAdmin[index])
								state.currentIsAdmin = true;
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
