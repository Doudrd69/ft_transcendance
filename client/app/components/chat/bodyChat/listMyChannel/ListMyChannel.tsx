import './ListMyChannel.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../ChatContext';
import { Socket } from 'socket.io-client';
import { useGlobal } from '@/app/GlobalContext';

interface ListMyChannelComponentProps {
	user: string;
	isAdd?: boolean;
	title?: string;
}

interface Conversation {
	id: number;
	name: string;
	is_channel: boolean;
	isProtected: boolean;
}

const ListMyChannelComponent: React.FC<ListMyChannelComponentProps> = ({ user, isAdd, title}) => {
	
	const { state, dispatch } = useChat();
	const { globalState } = useGlobal();

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const userID = sessionStorage.getItem("currentUserID");
	const userLogin = sessionStorage.getItem("currentUserLogin") || 'no-user';
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [password, setPassword] = useState('');
	
	const handlePasswordSubmit = (password: string) => {
		setPassword(password);
	};

	const handleCloseList = () => {
		dispatch({ type: 'DISABLE', payload: 'showListChannelAdd' });
		dispatch({ type: 'DISABLE', payload: 'showAddChannel' });
		dispatch({ type: 'DISABLE', payload: 'showCreateChannel' });
		dispatch({ type: 'DISABLE', payload: 'showAddCreateChannel' });
	};

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
				const { conversationList, isAdmin } = responseData;
				if (conversationList)
					setConversations((prevConversations: Conversation[]) => [...prevConversations, ...conversationList]);
			}
		}
		catch (error) {
			console.error(error);
		}
	};
	
	const loadDiscussionsPublic = async () => {
		try {
			const response = await fetch(`http://localhost:3001/chat/getConversationsPublic/${userID}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				}
			});	
			if (response.ok) {
				const conversationPublic = await response.json();
				if (conversationPublic)
					setConversations((prevConversations: Conversation[]) => [...prevConversations, ...conversationPublic]);
			}
		}
		catch (error) {
			console.error(error);
		}
	};
	
	const addUserToConversation = async (convID: number, friend: string) => {
		
		try {

			const addUserToConversationDto = {
				userToAdd: friend,
				conversationID: convID,
			}
			const response = await fetch('http://localhost:3001/chat/addUserToConversation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				},
				body: JSON.stringify(addUserToConversationDto),
			});
	
			if (response.ok) {
				const conversation = await response.json();
				if (conversation.id) {
						if (globalState.userSocket?.connected) {
              globalState.userSocket?.emit('addUserToRoom', { convID: conversation.id, convName: conversation.name, friend: user});
				     }
					console.log("Friend has been successfully added!");
					dispatch({ type: 'TOGGLEX', payload: 'showAddCreateChannel' });
					dispatch({ type: 'TOGGLEX', payload: 'showAddChannel' });
				}
			}
		}
		catch (error) {
			console.error(error);
		}
	}
	

	useEffect(() => {
		if (!isAdd)
			loadDiscussions();
		else
			loadDiscussionsPublic();
	}, [state.refreshChannel]);

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
				<p className="title-list-channel-component">{title}</p>
					<div className="bloc-add-channel-list">
						{conversations.map((conversation, index) => (
							conversation.is_channel && (
							<button
								key={index}
								className="button-add-channel-list"
								onClick={() => {
									if (conversation.isProtected && isAdd )
									{
										dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });
										dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
										dispatch({ type: 'SET_CURRENT_FRIEND', payload: userLogin });
										dispatch({ type: 'ACTIVATE', payload: 'showPassword' });
										dispatch({ type: 'DISABLE', payload: 'showAddChannel' });
										dispatch({ type: 'DISABLE', payload: 'showAddCreateChannel' });
									}
									else
										addUserToConversation(Number(conversation.id), user || 'no-user');}}>
									{conversation.isProtected && <img className="icon-password-channel" src='./password.png' alt="private" />}
									<span>{`${conversation.name}#${conversation.id}`}</span>
							</button>
						)))}
					</div>
			</div>
		</div>
	);
};
export default ListMyChannelComponent;