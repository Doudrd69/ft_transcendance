import './ListMyChannel.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../ChatContext';
import { Socket } from 'socket.io-client';
import { useGlobal } from '@/app/GlobalContext';

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
}

const ListMyChannelComponent: React.FC<ListMyChannelComponentProps> = ({ user, friendID, isAdd, title }) => {

	const { chatState, chatDispatch } = useChat();
	const { globalState } = useGlobal();

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const userID = sessionStorage.getItem("currentUserID");
	const userLogin = sessionStorage.getItem("currentUserLogin") || 'no-user';
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [password, setPassword] = useState('');

	console.log('isAdd',isAdd);
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
			console.log('loadDiscussions');
			console.log('userID', user);
			const response = await fetch(`http://localhost:3001/chat/getConversationsToAdd/${friendID}`, {
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
		}
		catch (error) {
			console.error(error);
		}
	};
	const loadDiscussionsPublic = async () => {
		try {
			console.log('loadDiscussionsPublic');
			const response = await fetch(`http://localhost:3001/chat/getConversationsPublic/${userID}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				}
			});
			if (response.ok) {
				const conversationPublic = await response.json();
				console.log('conversationPublic', conversationPublic);
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
			console.log("uueueuwerweurweiruwoeiruweoiruweoriuweoriuweroiweurw")

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
				console.log("uueueuwerweurweiruwoeiruweoiruweoriuweoriuweroiweurw")
				const conversation = await response.json();

				if (globalState.userSocket?.connected) {
					// on utilise la meme pour inviter et rejoindre --> probleme
					globalState.userSocket?.emit('addUserToRoom', {
						convID: conversation.id,
						convName: conversation.name,
						friend: user,
					});
					// refresh channel list
					globalState.userSocket?.emit('refreshUserChannelList', {
						userToRefresh: friend, 
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
					{conversations.map((conversation, index) => (
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
									}
									else
										addUserToConversation(Number(conversation.id), user || 'no-user');
								}}>
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