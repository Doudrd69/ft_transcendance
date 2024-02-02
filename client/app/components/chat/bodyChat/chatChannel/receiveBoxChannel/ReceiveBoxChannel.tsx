import './ReceiveBoxChannel.css';
import React, { useState, useEffect, useRef, use } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../../ChatContext';
import OptionsUserChannel from '../../addConversation/OptionsUserChannel';
import { useGlobal } from '@/app/GlobalContext';
import { toast } from 'react-toastify';
import { setCurrentUserList } from '../../../ChatContext';
import TimerComponent from '../../addConversation/Timer';
import ConfirmationComponent from '../../chatFriendsList/confirmation/Confirmation';
import { io } from 'socket.io-client';


interface Message {
	from: string;
	content: string;
	post_datetime: string;
	conversationID: number;
	senderId: number;
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
	const [gameSocketConnected, setgameSocketConnected] = useState<boolean>(false);
	const [gameInviteValidation, setgameInviteValidation] = useState<boolean>(false);
	const [gameInviteCalled, setGameInviteCalled] = useState<boolean>(false);

	const { dispatch } = useGlobal();


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

			const response = await fetch(`${process.env.API_URL}/chat/getMessages/${chatState.currentConversationID}`, {
				method: 'GET',
				headers: {
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
			});

			if (response.ok) {
				const messageList = await response.json();
				setMessages((prevMessages: Message[]) => [...prevMessages, ...messageList]);
			}
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const loadUserList = async () => {

		try {
			const response = await fetch(`${process.env.API_URL}/chat/getUserlist/${chatState.currentConversationID}`, {
				method: 'GET',
				headers: {
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
			});
	
			if (response.ok) {
				const data = await response.json();
				setUserList([...data]);
				setOwnerUser(data.find((user:User) => user.isOwner));
				setCurrentUser(data.find((user:User) => user.id === Number(sessionStorage.getItem("currentUserID"))));
			}
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {

		globalState.userSocket?.on('userJoinedRoom', (notification: Message) => {
			loadUserList();
			// setMessages((prevMessages: Message[]) => [...prevMessages, notification])
		});

		globalState.userSocket?.on('userIsBan', () => {
			chatDispatch({ type: 'DISABLE', payload: 'showChannel' });
			chatDispatch({ type: 'ACTIVATE', payload: 'showChannelList' });
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
			loadUserList();
		});

		globalState.userSocket?.on('recv_notif', (notif: Message) => {
			setMessages((prevMessages: Message[]) => [...prevMessages, notif]);
		});
		
		return () => {
			globalState.userSocket?.off('userJoinedRoom');
			globalState.userSocket?.off('onMessage');
			globalState.userSocket?.off('refresh_channel');
			globalState.userSocket?.off('kickUser');
			globalState.userSocket?.off('channelDeleted');
			globalState.userSocket?.off('recv_notif');
			globalState.userSocket?.off('userIsBan');
		};
		
	}, [globalState?.userSocket]);
	console.log(chatState);
	
	useEffect(() => {
		getMessages();
	}, []);

	useEffect(() => {
		loadUserList();
	}, [globalState.showRefresh]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);


	const gameInvite = () => {
		console.log("gameSocketConnected :", globalState?.gameSocket);
		// !gameInviteCalled && gameSocketConnected === false
		if (gameSocketConnected === false) {
			// setGameInviteCalled(true); // Marquer gameInvite comme appelée
			globalState.userSocket?.off('senderNotInGame');
			setgameInviteValidation(false);
			console.log("GAMEINVITE");
			globalState.userSocket?.emit('checkSenderInMatch', {
				senderUsername: sessionStorage.getItem("currentUserLogin"),
				senderUserId: sessionStorage.getItem("currentUserID"),
			})
			globalState.userSocket?.on('senderNotInGame', () => {
				console.log(`INVITATION: ${globalState.userSocket?.id}`);
				const gameSocket: Socket = io(`${process.env.API_URL}/game`, {
					autoConnect: false,
					auth: {
						token: sessionStorage.getItem("jwt"),
					}
				});
				gameSocket.connect();
				gameSocket.on('connect', () => {
					setgameSocketConnected(true);
					dispatch({ type: 'SET_GAME_SOCKET', payload: gameSocket });
					// emit le fait que je rentre en matchmaking, si l'autre refuse je fait un emethode pour le quitter avant de disconnect la socket
					gameSocket.emit('throwGameInvite')
					globalState.userSocket?.emit('inviteToGame', {
						usernameToInvite: chatState.currentTarget.login,
						userIdToInvite: chatState.currentTarget.id,
						senderID: gameSocket.id,
						senderUsername: sessionStorage.getItem("currentUserLogin"),
						senderUserID: sessionStorage.getItem("currentUserID"),
					});
				})
			})


		}
	};
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
						src={`${process.env.API_URL}${ownerUser?.avatarURL}`}
						onClick={() => {
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
									src={`${process.env.API_URL}${user.avatarURL}`}
									onClick={() => {
										chatDispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
										chatDispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
										chatDispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannel' });
										chatDispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload: user.login });
										chatDispatch({ type: 'SET_CURRENT_USER', payload: user });
										chatDispatch({ type: 'DISABLE', payload: 'showBackComponent' });
									}} />
								</>
								}
								{!user.isAdmin && !user.isOwner &&
								<img
								className='img-list-users-channel'
								src={`${process.env.API_URL}${user.avatarURL}`}
								onClick={() => {
										chatDispatch({ type: 'SET_CURRENT_TARGET', payload: user});
										chatDispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
										chatDispatch({ type: 'ACTIVATE', payload: 'showOptionsUserChannel' });
										chatDispatch({ type: 'SET_CURRENT_OPTION_CHANNEL_NAME', payload: user.login });
										chatDispatch({ type: 'SET_CURRENT_USER', payload: user });
										chatDispatch({ type: 'DISABLE', payload: 'showBackComponent' });
									}} />}
							</div>
						</div>
				  	))}
					{chatState.showOptionsUserChannel && !chatState.currentUser.isOwner && currentUser &&
					(<OptionsUserChannel user={chatState.currentUser} me={currentUser}/>)
					}
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
								src={`${process.env.API_URL}/users/getAvatar/${message.senderId}/${timestamp}`}
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
				{chatState.showConfirmation && (
				<ConfirmationComponent phrase={`Etes vous sur de vouloir defier ${chatState.currentTarget.login}`} functionToExecute={gameInvite} />
			)}
			</>
		);
	};

	export default ReceiveBoxChannelComponent;