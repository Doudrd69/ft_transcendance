import './ChannelList.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../../ChatContext';
import AddConversationComponent from '../../addConversation/AddConversation';
import { Socket } from 'socket.io-client';
import ListMyChannelComponent from '../../listMyChannel/ListMyChannel';
import PasswordComponent from '../../listMyChannel/Password';

interface Conversation {
	id: string;
	name: string;
	is_channel: boolean;
	isPublic: boolean;
	isProtected: boolean;
}

interface ChanneListComponentProps {
	userSocket: Socket;
}
interface userList {
	login: string;
	avatarURL: string;
}

const ChannelListComponent: React.FC<ChanneListComponentProps> = ({ userSocket }) => {

	const { state, dispatch } = useChat();

	const userID = Number(sessionStorage.getItem("currentUserID"));
	const userName = sessionStorage.getItem("currentUserLogin")

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [isAdmin, setIsAdmin] = useState<boolean[]>([]);
	const [userList, setUserList] = useState<userList[]>([]);
	const [isAdd, setIsAdd] = useState<boolean>(false);
	

	const loadDiscussions = async () => {

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
			// console.log("userList --> ", userList);
			// console.log("isAdmin --> ", isAdmin);
		}
		else {
			console.log("Fatal error");
		}
	};
	
	console.log("state.showPassword =====> ", state.showPassword);

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
				{state.showPassword ? <PasswordComponent userSocket={userSocket}/> : null}
				{state.showAddChannel ? <ListMyChannelComponent userSocket={userSocket} user={userName || 'no-user'} isAdd={true} title="JOIN CHANNEL"></ListMyChannelComponent> : null}
				{state.showCreateChannel ? <AddConversationComponent userSocket={userSocket} loadDiscussions={loadDiscussions} title="CREATE CHANNEL" isChannel={true} /> : null}
			</div>
			{conversations.map((conversation, index) => (
					conversation.is_channel && (
					<button
					key={index}
					className="button-channel-list"
					onClick={() => {
						dispatch({ type: 'TOGGLE', payload: 'showChannel' });
						dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
						dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });
						dispatch({ type: 'SET_CURRENT_CONVERSATION_IS_PRIVATE', payload: state.currentConversationIsPublic });
						dispatch({ type: 'SET_CURRENT_CONVERSATION_IS_PROTECTED', payload: state.currentConversationIsProtected });
						dispatch({ type: 'ACTIVATE', payload: 'currentChannelBool' });
						if(isAdmin[index])
							dispatch({ type: 'ACTIVATE', payload: 'showAdmin' });
						dispatch({ type: 'SET_CURRENT_USER_LIST', payload: userList[index] });
						console.log("userList[index] =====> ", index ,userList[index]);
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