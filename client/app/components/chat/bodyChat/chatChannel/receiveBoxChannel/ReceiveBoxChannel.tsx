import './ReceiveBoxChannel.css';
import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../../ChatContext';
import OptionsUserChannel from '../../addConversation/OptionsUserChannel';
import { useGlobal } from '@/app/GlobalContext';

interface Message {
	from: string;
	content: string;
	post_datetime: string;
	conversationID: number;
}

interface userList {
	login: string;
	avatarURL: string;
	isAdmin: boolean;
	isMute: boolean;
	isBan: boolean;
	isOwner: boolean;
	isBlock: boolean;
	id: number;
}

const ReceiveBoxChannelComponent: React.FC = () => {

	const { state, dispatch } = useChat();
	const { globalState } = useGlobal();
	const [messages, setMessages] = useState<Message[]>([]);
	const messagesContainerRef = useRef<HTMLDivElement>(null);

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
		const response = await fetch(`http://localhost:3001/chat/getMessages/${state.currentConversationID}`, {
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

 	const ownerUsers_array = state.currentUserList.filter((user: userList) => user.isOwner === true);
	console.log("userlist: ", state.currentUserList);

	const ownerUsers = ownerUsers_array[0];
	console.log("Owner: ", ownerUsers);

	const me_array = state.currentUserList.filter((user: userList) => user.login === sessionStorage.getItem("currentUserLogin"));
	const me = me_array[0];

	useEffect(() => {
		globalState.userSocket?.on('userJoinedRoom', (notification: string) => {
		console.log("Channel log: ", notification);
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
		console.log("Loading conversation...");
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
							<img className='admin-user' src='./crown.png' alt='user' />
							<img
							className='img-list-users-channel-admin'
							src={`http://localhost:3001/users/getAvatarByLogin/${ownerUsers.login}/${timestamp}`}
							onClick={() => {
								dispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
								dispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannelOwner' });
								dispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload: ownerUsers?.login});
								dispatch({ type: 'DISABLE', payload: 'showBackComponent' });
						}}/>
						</div>
					{state.showOptionsUserChannelOwner && 
						<OptionsUserChannel user={ownerUsers} me={me} />
					}
				</div>
			</div>
			<div className='list-users-channel'>
				{state.currentUserList && state.currentUserList?.map((userList: userList, index: number) => (
				<div key={index} className='user-list-item'>

						{userList?.isAdmin && !userList?.isOwner &&
							<div className='avatar-container'>
								<img className='admin-user' src='./crown.png' alt='user' />
								<img
								className='img-list-users-channel-admin'
								src={`http://localhost:3001/users/getAvatarByLogin/${userList.login}/${timestamp}`}
								onClick={() => {
									dispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
									dispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannel' });
									dispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload: userList.login});
									dispatch({ type: 'DISABLE', payload: 'showBackComponent' });
								}}/>
							</div>}
						{!userList.isAdmin && !userList.isOwner &&
							<img
								className='img-list-users-channel'
								src={`http://localhost:3001/users/getAvatarByLogin/${userList.login}/${timestamp}`}
								onClick={() => {
									dispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
									dispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannel' });
									dispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload: userList.login});
									dispatch({ type: 'DISABLE', payload: 'showBackComponent'});
							}}/>}
					{state.showOptionsUserChannel && !userList.isOwner &&
						(<OptionsUserChannel user={userList} me={me}/>)
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