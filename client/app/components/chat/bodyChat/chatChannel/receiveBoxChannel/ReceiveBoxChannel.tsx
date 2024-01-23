import './ReceiveBoxChannel.css';
import React, { useState, useEffect, useRef, use } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../../ChatContext';
import OptionsUserChannel from '../../addConversation/OptionsUserChannel';
import { useGlobal } from '@/app/GlobalContext';
import { toast } from 'react-toastify';
import { setCurrentUserList } from '../../../ChatContext';

interface Message {
	from: string;
	content: string;
	post_datetime: string;
	conversationID: number;
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

const ReceiveBoxChannelComponent: React.FC = () => {

	const { state, dispatch } = useChat();
	const { globalState } = useGlobal();
	const [messages, setMessages] = useState<Message[]>([]);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const [userList, setUserList] = useState<User[]>();
	const [owner, setOwner] = useState<User>();
	const [me, setMe] = useState<User>();


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

	const loadUserList = async () => {

		try {
			const response = await fetch(`http://localhost:3001/chat/getUserlist/${state.currentConversationID}`, {
				method: 'GET',
				headers: {
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
			});
	
			if (response.ok) {
				const userList = await response.json();
				setUserList([...userList]);
			}
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {

		globalState.userSocket?.on('userJoinedRoom', (notification: string) => {
		console.log("Channel log: ", notification);
		});

		globalState.userSocket?.on('onMessage', (message: Message) => {
		if (message)
			setMessages((prevMessages: Message[]) => [...prevMessages, message]);
		});

		globalState.userSocket?.on('kickUser', ( data: {roomName: string, roomID: string} ) => {
			const { roomName, roomID } = data;
			dispatch({ type: 'DISABLE', payload: 'showChannel' });
		});

		globalState.userSocket?.on('channelDeleted', ( data: {roomName: string, roomID: string} ) => {
			const { roomName, roomID } = data;
			globalState.userSocket?.emit('leaveRoom', { roomName: roomName, roomID: roomID });
			dispatch({ type: 'DISABLE', payload: 'showChannel' });
		});

		globalState.userSocket?.on('refresh_channel', () => {
			loadUserList();
		});
		
		return () => {
			globalState.userSocket?.off('userJoinedRoom');
			globalState.userSocket?.off('onMessage');
			globalState.userSocket?.off('refresh_channel');
			globalState.userSocket?.off('kickUser');
			globalState.userSocket?.off('channelDeleted');
		};
		
	}, [globalState?.userSocket]);
	
	useEffect(() => {
		loadUserList();
	}, [owner]);
	
	useEffect(() => {
		console.log("Loading conversation...");
		getMessages();
	}, []);

	useEffect(() => {
		loadUserList();
	}, [globalState.showRefresh]);

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
							src={`http://localhost:3001${userList?.filter((user: User) => user.isOwner === true)[0]?.avatarURL}`}
							onClick={() => {
								dispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
								dispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannelOwner' });
								dispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload: userList?.filter((user: User) => user.isOwner === true)[0]?.login});
								dispatch({ type: 'DISABLE', payload: 'showBackComponent' });
						}}/>
						</div>
					{state.showOptionsUserChannelOwner && userList?.filter((user: User) => user.isOwner === true)[0] && 
						<OptionsUserChannel user={userList?.filter((user: User) => user.isOwner === true)[0]} me={userList?.filter((user: User) => user.login === sessionStorage.getItem("currentUserLogin"))[0]} />
					}
				</div>
			</div>
			<div className='list-users-channel'>
				{userList && userList?.map((user: User, index: number) => (
					<div key={index} className='user-list-item'>
						{user?.isAdmin && !user?.isOwner &&
							<div className='avatar-container'>
								<img className='admin-user' src='./crown.png' alt='user' />
								<img
								className='img-list-users-channel-admin'
								src={`http://localhost:3001${user?.avatarURL}`}
								onClick={() => {
									dispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
									dispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannel' });
									dispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload: user.login});
									dispatch({ type: 'DISABLE', payload: 'showBackComponent' });
								}}/>
							</div>}
						{!user.isAdmin && !user.isOwner &&
							<img
								className='img-list-users-channel'
								src={`http://localhost:3001/users/getAvatarByLogin/${user.login}/${timestamp}`}
								onClick={() => {
									dispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
									dispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannel' });
									dispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload: user.login});
									dispatch({ type: 'DISABLE', payload: 'showBackComponent'});
							}}/>}
					{state.showOptionsUserChannel && !user.isOwner && userList?.filter((user: User) => user.login === sessionStorage.getItem("currentUserLogin"))[0] &&
						(<OptionsUserChannel user={user} me={userList?.filter((user: User) => user.login === sessionStorage.getItem("currentUserLogin"))[0]}/>)
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