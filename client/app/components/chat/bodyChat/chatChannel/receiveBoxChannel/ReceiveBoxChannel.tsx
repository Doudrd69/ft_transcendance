import './ReceiveBoxChannel.css';
import React, { useState, useEffect, useRef, use } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../../ChatContext';
import OptionsUserChannel from '../../addConversation/OptionsUserChannel';
import { useGlobal } from '@/app/GlobalContext';
import { toast } from 'react-toastify';
import { setCurrentUserList } from '../../../ChatContext';
import TimerComponent from '../../addConversation/Timer';

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
	blockList: string[];
}


const ReceiveBoxChannelComponent: React.FC = () => {

	const { chatState, chatDispatch } = useChat();
	const { globalState } = useGlobal();
	const [messages, setMessages] = useState<Message[]>([]);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const [userList, setUserList] = useState<User[]>();
	const [ownerUser, setOwnerUser] = useState<User>();
	const [currentUser, setCurrentUser] = useState<User>();


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
		const response = await fetch(`http://localhost:3001/chat/getMessages/${chatState.currentConversationID}`, {
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
			const response = await fetch(`http://localhost:3001/chat/getUserlist/${chatState.currentConversationID}`, {
				method: 'GET',
				headers: {
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
			});
	
			if (response.ok) {
				const data = await response.json();
				setUserList([...data]);
				setOwnerUser(data.find((user:User) => user.isOwner));
				setCurrentUser(data.find((user:User) => user.login === sessionStorage.getItem("currentUserLogin")));
			}
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {

		globalState.userSocket?.on('userJoinedRoom', (notification: Message) => {
			console.log("Channel log: ", notification);
			loadUserList();
			// setMessages((prevMessages: Message[]) => [...prevMessages, notification])
		});

		globalState.userSocket?.on('onMessage', (message: Message) => {
			if (message && (message.conversationID == chatState.currentConversationID))
				setMessages((prevMessages: Message[]) => [...prevMessages, message]);
		});

		globalState.userSocket?.on('kickUser', ( data: {roomName: string, roomID: string} ) => {
			const { roomName, roomID } = data;
			chatDispatch({ type: 'DISABLE', payload: 'showChannel' });
		});

		globalState.userSocket?.on('channelDeleted', ( data: {roomName: string, roomID: string} ) => {
			const { roomName, roomID } = data;
			globalState.userSocket?.emit('leaveRoom', { roomName: roomName, roomID: roomID });
			chatDispatch({ type: 'DISABLE', payload: 'showChannel' });
			chatDispatch({ type: 'ACTIVATE', payload: 'showChannelList' });
		});

		globalState.userSocket?.on('refresh_channel', () => {
			console.log("Refresh channel...");
			loadUserList();
		});

		globalState.userSocket?.on('recv_notif', (notif: Message) => {
			console.log('notifffffffff', notif);
			setMessages((prevMessages: Message[]) => [...prevMessages, notif]);
		});
		
		return () => {
			globalState.userSocket?.off('userJoinedRoom');
			globalState.userSocket?.off('onMessage');
			globalState.userSocket?.off('refresh_channel');
			globalState.userSocket?.off('kickUser');
			globalState.userSocket?.off('channelDeleted');
			globalState.userSocket?.off('recv_notif');
		};
		
	}, [globalState?.userSocket]);
	
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
	// console.log("ownerUser", ownerUser)
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
						src={`http://localhost:3001${ownerUser?.avatarURL}`}
						onClick={() => {
							{console.log("ownerUser", ownerUser?.avatarURL)}
						  chatDispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
						  chatDispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannelOwner' });
						  chatDispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload: ownerUser?.login });
						  chatDispatch({ type: 'DISABLE', payload: 'showBackComponent' });
						}} />
					</div>
					{chatState.showOptionsUserChannelOwner && ownerUser &&
						currentUser && <OptionsUserChannel user={ownerUser} me={currentUser} />}
					</div>
					</div>
					<div className='list-users-channel'>
					{userList && userList?.map((user: User, index: number) => (
						<div key={index} className='user-list-item'>
						<div className='avatar-container'>
							{user.isAdmin && !user.isOwner &&
							<>
								<img className='admin-user' src='./crown.png' alt='user' />
								<img
								className='img-list-users-channel-admin'
								src={`http://localhost:3001${user.avatarURL}`}
								onClick={() => {
									chatDispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
									chatDispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
									chatDispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannel' });
									chatDispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload: user.login });
									chatDispatch({ type: 'DISABLE', payload: 'showBackComponent' });
								}} />
							</>
						}
						{!user.isAdmin && !user.isOwner &&
						  <img
						  className='img-list-users-channel'
						  src={`http://localhost:3001${user.avatarURL}`}
						  onClick={() => {
								chatDispatch({ type: 'SET_CURRENT_TARGET', payload: user});
								chatDispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
								chatDispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannel' });
								chatDispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload: user.login });
								chatDispatch({ type: 'DISABLE', payload: 'showBackComponent' });
							}} />}
					  </div>
					  {chatState.showOptionsUserChannel && !user.isOwner && currentUser &&
						(<OptionsUserChannel user={user} me={currentUser}/>)
					}
					</div>
				  ))}
				</div>
				</div>
				<div ref={messagesContainerRef} className="bloc-channel-chat">
				{messages.map((message: Message, id: number) => (
					<div key={id} className="bloc-contain">
					<div className="bloc-avatar-username">
						{message.from === 'Bot' ?
							<>
								<img
									src="./robot.png"
									className='avatar-channel'
									alt="bot"
									/>
									<div className="user-name">Bot</div>
							</>
							:
							<>
								<img
								src={`http://localhost:3001/users/getAvatarByLogin/${message.from}/${timestamp}`}
								className='avatar-channel'
								alt="User Avatar"
								/>
								<div className="user-name">{message.from}</div>
							</>
						}
					</div>
					<div className={`message-container ${isMyMessage(message) ? 'my-message-channel' : 'other-message-channel'}`}>
						<p className="channel-chat-content">{message.content}</p>
						<p className="channel-chat-date">{formatDateTime(message.post_datetime)}</p>
					</div>
					</div>		
				))}
				</div>
				{chatState.showTimer && <TimerComponent user={chatState.currentTarget}/>}
			</>
		);
	};

export default ReceiveBoxChannelComponent;