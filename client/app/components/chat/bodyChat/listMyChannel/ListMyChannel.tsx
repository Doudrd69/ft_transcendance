import './ListMyChannel.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../ChatContext';
import { Socket } from 'socket.io-client';
import { useGlobal } from '@/app/GlobalContext';
import { toast } from 'react-toastify';

interface ListMyChannelComponentProps {
	user: string;
	friendID?: number;
	isAdd?: boolean;
	title?: string;
}

interface Conversation {
	id: number;
	name: string;
	is_channel: boolean;
	isProtected: boolean;
	// mutedusers: number[];
}


const ListMyChannelComponent: React.FC<ListMyChannelComponentProps> = ({ user, friendID, isAdd, title }) => {
	
	const { chatState, chatDispatch } = useChat();
	const { globalState } = useGlobal();

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const userLogin = sessionStorage.getItem("currentUserLogin") || 'no-user';
	const [password, setPassword] = useState('');

	const handlePasswordSubmit = (password: string) => {
		setPassword(password);
	};

	const handleCloseList = () => {
		chatDispatch({ type: 'DISABLE', payload: 'showListChannelAdd' });
		chatDispatch({ type: 'DISABLE', payload: 'showAddChannel' });
		chatDispatch({ type: 'DISABLE', payload: 'showCreateChannel' });
		chatDispatch({ type: 'DISABLE', payload: 'showAddCreateChannel' });
	};

	const loadDiscussions = async () => {
		try {

			const response = await fetch(`${process.env.API_URL}/chat/getConversationsToAdd/${friendID}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				}
			});
			if (response.ok) {
				const responseData = await response.json();
				if (responseData)
					setConversations((prevConversations: Conversation[]) => [...prevConversations, ...responseData]);

			}
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		}
		catch (error) {
			console.error(error);
		}
	};

	const loadDiscussionsPublic = async () => {
		try {
			const response = await fetch(`${process.env.API_URL}/chat/getConversationsPublic`, {
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
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		}
		catch (error) {
			console.error(error);
		}
	};

	const addUserToConversation = async (convID: number, friendID: any) => {

		try {

			const addUserToConversationDto = {
				userToAdd: Number(friendID),
				conversationID: convID,
			}

			const response = await fetch(`${process.env.API_URL}/chat/addUserToConversation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				},
				body: JSON.stringify(addUserToConversationDto),
			});

			if (response.ok) {

				const conversation = await response.json();

				if (globalState.userSocket?.connected) {

					// Add users sockets to channel room
					globalState.userSocket?.emit('addUserToRoom', {
						convID: conversation.id,
						convName: conversation.name,
						friend: friendID,
					});
					
					// refresh channel list
					globalState.userSocket?.emit('refreshUserChannelList', {
						userToRefresh: user, 
					});

					chatDispatch({ type: 'TOGGLEX', payload: 'showAddCreateChannel' });
					chatDispatch({ type: 'TOGGLEX', payload: 'showAddChannel' });

					chatDispatch({ type: 'DISABLE', payload: 'showListChannelAdd' });
				}
			}
			else {
				const error = await response.json();
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

	const addMyselfToConversation = async (convID: number) => {

		try {

			const addUserToConversationDto = {
				conversationID: convID,
			}

			const response = await fetch(`${process.env.API_URL}/chat/addUserToConversation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				},
				body: JSON.stringify(addUserToConversationDto),
			});

			if (response.ok) {
				chatDispatch({ type: 'TOGGLEX', payload: 'refreshChannel' });
				const conversation = await response.json();

				if (globalState.userSocket?.connected) {

					globalState.userSocket?.emit('joinRoom', {
						roomName: conversation.name,
						roomID: conversation.id,
					});

					// refresh channel list
					globalState.userSocket?.emit('refreshUserChannelList', {
						userToRefresh: userLogin, 
					});

					// refresh userList in channel for user arrival update
					globalState.userSocket?.emit('refreshChannel', {
						channel: conversation.name + conversation.id,
					});


					chatDispatch({ type: 'TOGGLEX', payload: 'showAddCreateChannel' });
					chatDispatch({ type: 'TOGGLEX', payload: 'showAddChannel' });
					chatDispatch({ type: 'DISABLE', payload: 'showListChannelAdd' });
				}
			}
			else {
				const error = await response.json();
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
		if (!isAdd)
			loadDiscussions();
		else
			loadDiscussionsPublic();
	}, [chatState.refreshChannel]);

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
			<img className="add_button_cancel" src='./close.png' onClick={handleCloseList} />
			<div className='juste-pour-englober'>
				<p className="title-list-channel-component">{title}</p>
				<div className="bloc-add-channel-list">
					{conversations.length === 0 ? (
						<div> aucun channel existant</div>
					) : (
						conversations.map((conversation, index) => (
						conversation.is_channel && (
							<button
							key={index}
							className="button-add-channel-list"
							onClick={() => {
								if (conversation.isProtected && isAdd) {
								chatDispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });
								chatDispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
								chatDispatch({ type: 'SET_CURRENT_FRIEND', payload: userLogin });
								chatDispatch({ type: 'ACTIVATE', payload: 'showPassword' });
								chatDispatch({ type: 'DISABLE', payload: 'showAddChannel' });
								chatDispatch({ type: 'DISABLE', payload: 'showAddCreateChannel' });
								} else {
								!isAdd
									? addUserToConversation(Number(conversation.id), friendID)
									: addMyselfToConversation(Number(conversation.id));
								}
							}}
							>
							{conversation.isProtected && <img className="icon-password-channel" src='./password.png' alt="private" />}
							<span>{`${conversation.name}#${conversation.id}`}</span>
							</button>
						)
						))
					)}
					</div>
			</div>
		</div>
	);
};
export default ListMyChannelComponent;