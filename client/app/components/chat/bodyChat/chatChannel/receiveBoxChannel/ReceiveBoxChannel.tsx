import './ReceiveBoxChannel.css';
import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../../ChatContext';
import OptionsUserChannel from '../../addConversation/OptionsUserChannel';
import { useGlobal } from '@/app/GlobalContext';
import { userAgent } from 'next/server';
import { UserChannel } from '../../../types';
interface Message {
	from: string;
	content: string;
	post_datetime: string;
	conversationID: number;
}

const ReceiveBoxChannelComponent: React.FC = () => {

	const { state, dispatch } = useChat();
	const { globalState } = useGlobal();
	const [messages, setMessages] = useState<Message[]>([]);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	// const  owner = state.currentChannelUserList?.find((user: UserChannel) => user.username ===  sessionStorage.getItem("currentUserLogin"));
	const owner = Array.isArray(state.currentChannelUserList)
		? state.currentChannelUserList.find((user: UserChannel) => user.isOwner)
		: null;
	const isMyMessage = (message: Message): boolean => {
		return message.from === sessionStorage.getItem("currentUserLogin");
	};


	const scrollToBottom = () => {
		if (messagesContainerRef.current) {
			const container = messagesContainerRef.current;
			container.scrollTop = container.scrollHeight;
		}
	};
	const formatDateTime = (dateTimeString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			day: 'numeric',
			month: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		};
		const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(new Date(dateTimeString));
		return formattedDate;
	};

	const getMessages = async () => {
		try {
		const response = await fetch(`http://localhost:3001/chat/getMessages/${state.currentChannel?.id}`, {
			method: 'GET',
			headers: {
			'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			},
		});

		if (response.ok) {
			const messageList = await response.json();
			setMessages((prevMessages: Message[]) => [...prevMessages, ...messageList]);
		}
		} catch (error) {
			console.log(error);
		}
	};

	// gerer le cas ou la liste est vide
	useEffect(() => {
		globalState.userSocket?.on('userJoinedRoom', (notification: string) => {
		});

		globalState.userSocket?.on('onMessage', (message: Message) => {
		if (message)
			setMessages((prevMessages: Message[]) => [...prevMessages, message]);
		});

		return () => {
			globalState.userSocket?.off('userJoinedRoom');
			globalState.userSocket?.off('onMessage');
		};
	}, [globalState?.userSocket]);

	useEffect(() => {
		getMessages();
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const timestamp = new Date().getTime();
	return (
		<>
		<div className='bloc-owner-user'>
			<div className='list-users-channel-owner'>
				<div className='user-list-item'>
						<div className='avatar-container'>
							{owner &&
								<>
									<img className='admin-user' src='./crown.png' alt='user' />
									<img
									className='img-list-users-channel-admin'
									src={`http://localhost:3001/users/getAvatarByLogin/${owner.username}/${timestamp}`}
									onClick={() => {
										dispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
										dispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannelOwner' });
										dispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload:(owner?.username)});
										dispatch({ type: 'DISABLE', payload: 'showBackComponent' });
									}}/>
								</>
							
							}
						</div>
					{state.showOptionsUserChannelOwner && owner &&
						<OptionsUserChannel user={owner} isBlock={false}/>
					}
				</div>
			</div>
			<div className='list-users-channel'>
				{Array.isArray(state.currentChannelUserList) && state.currentChannelUserList?.map((user: UserChannel, index: number) => (
				<div key={index} className='user-list-item'>
						{user.isAdmin && !user.isOwner &&
							<div className='avatar-container'>
								<img className='admin-user' src='./crown.png' alt='user' />
								<img
								className='img-list-users-channel-admin'
								src={`http://localhost:3001/users/getAvatarByLogin/${user.username}/${timestamp}`}
								onClick={() => {
									dispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
									dispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannel' });
									dispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload: user.username});
									dispatch({ type: 'DISABLE', payload: 'showBackComponent' });
								}}/>
							</div>}
						{!user.isAdmin && !user.isOwner &&
							<img
								className='img-list-users-channel'
								src={`http://localhost:3001/users/getAvatarByLogin/${user.username}/${timestamp}`}
								onClick={() => {
									dispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
									dispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannel' });
									dispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload: user.username });
									dispatch({ type: 'DISABLE', payload: 'showBackComponent'});
							}}/>}
					{state.showOptionsUserChannel && !user.isOwner &&
						(<OptionsUserChannel user={user} isBlock={false}/>)
					}
				</div>
				))}
			</div>
		</div>
		<div ref={messagesContainerRef} className="bloc-channel-chat">
			{messages.map((message: Message, id: number) => (
				<div key={id} className="bloc-contain">
					<div className="bloc-avatar-username">
						<img
							src={`http://localhost:3001/users/getAvatarByLogin/${message.from}/${timestamp}`}
							className='avatar-channel'
							alt="User Avatar"
						/>
						<div className="user-name">{message.from}</div>
					</div>
					<div className={`message-container ${isMyMessage(message) ? 'my-message-channel' : 'other-message-channel'}`}>
						<p className="channel-chat-content">{message.content}</p>
						<p className="channel-chat-date">{formatDateTime(message.post_datetime)}</p>
					</div>
				</div>
			))}
		</div>
		</>
	);
};

export default ReceiveBoxChannelComponent;