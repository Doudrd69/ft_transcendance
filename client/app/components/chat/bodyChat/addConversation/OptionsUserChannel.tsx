import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { setCurrentComponent, useChat } from '../../ChatContext';
import './AddConversation.css';
import { RSC } from 'next/dist/client/components/app-router-headers';
import { useGlobal } from '@/app/GlobalContext';
import TimerComponent from './Timer';
import { toast } from 'react-toastify';
import ConfirmationComponent from '../chatFriendsList/confirmation/Confirmation';

interface User {
	id: number;
	login: string;
	avatarURL: string;
	isAdmin: boolean;
	isMute: boolean;
	isBan: boolean;
	isOwner: boolean;
	blockList: number[];
}

interface OptionsUserChannelProps {
	user: User
	me : User
}

interface Conversation {
	name: string,
	id: number,
}

const OptionsUserChannel: React.FC<OptionsUserChannelProps> = ({ user , me }) => {

	const { chatState, chatDispatch } = useChat();
	const { globalState, dispatch } = useGlobal();
	const [formValue, setFormValue] = useState('');
	const [admin, setAdmin] = useState<boolean>(user.isAdmin);
	const [mute, setMute] = useState<boolean>(user.isMute);
	const [ban, setBan] = useState<boolean>(user.isBan);
	const [confirmationText, setConfirmationText] = useState('');
	const [funtionToExecute, setFunctionToExecute] = useState<() => void>(() => { });
	const [gameSocketConnected, setgameSocketConnected] = useState<boolean>(false);
	const [gameInviteValidation, setgameInviteValidation] = useState<boolean>(false);
	const [block, setBlock] = useState<boolean>(!!me.blockList.find((userblock: number) => userblock === user.id));
	
	// console.log(chatState);
	// if (me && me.blockList) {
	// 	setBlock (!!me.blockList.find((userblock) => userblock === user.login));
	// }

	
	const blockUser = async() => {

		const BlockUserDto = {
			recipientID: user.id,
		}

		const response = await fetch(`${process.env.API_URL}/users/blockUser`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			},
			body: JSON.stringify(BlockUserDto),
		});

		if (response.ok) {
			if (!block)
				setBlock(true);
			const userToBlock = await response.json();
			if (userToBlock && globalState.userSocket && chatState.currentConversation && chatState.currentConversationID) {
				globalState.userSocket?.emit('joinRoom', { roomName: `whoblocked${userToBlock}`, roomID: '' } );
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

	const unblockUser = async() => {

		const BlockUserDto = {
			recipientID: user.id,
		}

		const response = await fetch(`${process.env.API_URL}/users/unblockUser`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			},
			body: JSON.stringify(BlockUserDto),
		});
		
		if (response.ok) {
			if (block)
				setBlock (false);
			const userToUnblock = await response.json();
			if (userToUnblock && globalState.userSocket && chatState.currentConversation && chatState.currentConversationID) {
				globalState.userSocket?.emit('leaveRoom', { roomName: `whoblocked${userToUnblock}`, roomID: '' } );
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

	const unmuteUser = async() => {

		try {
			const userOptionDto = {
				conversationID: Number(chatState.currentConversationID),
				target: user.id,
				state: false,
			}
	
			const response = await fetch(`${process.env.API_URL}/chat/unmuteUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(userOptionDto),
			});
		
			if (response.ok) {
				user.isMute = !user.isMute;
				setMute(false);
				if (chatState.currentConversation) {
					globalState.userSocket?.emit('emitNotification', {
						channel: chatState.currentConversation + chatState.currentConversationID,
						content: `${user.login} has been unmuted`,
						channelID: chatState.currentConversationID,
					});
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
	
	const muteUser = async() => {
		chatDispatch({ type: 'ACTIVATE', payload: 'showTimer' });
		chatDispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
		chatDispatch({ type: 'SET_CURRENT_TARGET', payload: user });
	}

	const banUser = async() => {

		try{

			const userOptionDto = {
				conversationID: Number(chatState.currentConversationID),
				target: user.id,
				state : true,
			}
	
			const response = await fetch(`${process.env.API_URL}/chat/banUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(userOptionDto),
			});
		
			if (response.ok) {
				const status = await response.json();
				user.isBan = !user.isBan;
				setBan(true);

				if (chatState.currentConversation) {

					// event to disable showChannel for banned user and refresh channel list
					globalState.userSocket?.emit('banUser', {
						userToBan: user.id,
						roomName: chatState.currentConversation,
						roomID: chatState.currentConversationID
					});

					globalState.userSocket?.emit('refreshUserOptionsChannel');

					globalState.userSocket?.emit('emitNotification', {
						channel: chatState.currentConversation + chatState.currentConversationID,
						content: `${user.login} has been ban`,
						channelID: chatState.currentConversationID,
					});
				}
				else {
					const error = await response.json();
					if (Array.isArray(error.message))
						toast.warn(error.message[0]);
					else
						toast.warn(error.message);
				}
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const unbanUser = async() => {

		try {

			const userOptionDto = {
				conversationID: Number(chatState.currentConversationID),
				target: user.id,
				state : false,
			}
	
			const response = await fetch(`${process.env.API_URL}/chat/unbanUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(userOptionDto),
			});
		
			if (response.ok) {
				const status = await response.json();
				user.isBan = !user.isBan;
				setBan(false);

				if (chatState.currentConversation) {

					globalState.userSocket?.emit('unbanUser', {
						userToUnban: user.id,
						roomName: chatState.currentConversation,
						roomID: chatState.currentConversationID
					});

					globalState.userSocket?.emit('refreshUserOptionsChannel');

					globalState.userSocket?.emit('emitNotification', {
						channel: chatState.currentConversation + chatState.currentConversationID,
						content: `${user.login} has been unban`,
						channelID: chatState.currentConversationID,
					});
				}
				else {
					const error = await response.json();
					if (Array.isArray(error.message))
						toast.warn(error.message[0]);
					else
						toast.warn(error.message);
				}
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const promoteAdminUser = async() => {
		
		try {
			const userOptionDto = {
				conversationID: Number(chatState.currentConversationID),
				target: user.id,
				state : true,
			}
	
			const response = await fetch(`${process.env.API_URL}/chat/promoteAdminUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(userOptionDto),
			});
		
			if (response.ok) {
				user.isAdmin = !user.isAdmin;

				if (chatState.currentConversation) {

					// Emit notification to channel
					globalState.userSocket?.emit('emitNotification', {
						channel: chatState.currentConversation + chatState.currentConversationID,
						content: `${user.login} has been promoted to admin`,
						channelID: chatState.currentConversationID,
					});

					globalState.userSocket?.emit('refreshUserOptionsChannel');
	
					// emit sur un refreshd e channel?
					globalState.userSocket?.emit('refreshUser', {
						userToRefresh: user.id,
						target: 'refreshAdmin',
						status: true,
					});

					// refresh the channel list of userToRefresh (who has been promoted)
					globalState.userSocket?.emit('refreshUserChannelList', {
						userToRefresh: user.login,
					});
				}

				setAdmin(true);
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

	const demoteAdminUser = async() => {
		
		try{
			const userOptionDto = {
				conversationID: Number(chatState.currentConversationID),
				target: user.id,
				state : false,
			}
	
			const response = await fetch(`${process.env.API_URL}/chat/demoteAdminUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(userOptionDto),
			});
			if (response.ok) {
				user.isAdmin = !user.isAdmin;

				if (chatState.currentConversation) {
					
					globalState.userSocket?.emit('emitNotification', {
						channel: chatState.currentConversation + chatState.currentConversationID,
						content: `${user.login} has been demoted to admin`,
						channelID: chatState.currentConversationID,
					});

					globalState.userSocket?.emit('refreshUserOptionsChannel');

					// emit sur un refresh de channel
					globalState.userSocket?.emit('refreshUser', {
						userToRefresh: user.id,
						target: 'refreshAdmin',
						status: true,
					});

					// refresh the channel list of userToRefresh (who has been demoted)
					globalState.userSocket?.emit('refreshUserChannelList', {
						userToRefresh: user.login,
					});

	
				}

				setAdmin(false);
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
	
	const handleLeaveChannel = async() => {
		try {
			const quitlConversationDto = {
					conversationID: Number(chatState.currentConversationID),
					userID: user.id,
			}
	
			const response = await fetch(`${process.env.API_URL}/chat/quitConversation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(quitlConversationDto),
			});
	
			if (response.ok) {
					// je quitte le channel donc faut refresh le composant pour les autres
					chatDispatch({ type: 'ACTIVATE', payload: 'showChannelList' });
					chatDispatch({ type: 'DISABLE', payload: 'showChannel' });
					chatDispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });

					if (chatState.currentConversation) {
						globalState.userSocket?.emit('leaveRoom', {
							roomName: chatState.currentConversation,
							roomID: chatState.currentConversationID,
						});
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
			console.log(error);
		}
	}
	
	const handleKickChannel = async() => {
		try {
			const KickConversationDto = {
					conversationID: Number(chatState.currentConversationID),
					userToKickID: user.id,
			}
	
			const response = await fetch(`${process.env.API_URL}/chat/kickUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(KickConversationDto),
			});

			if (response.ok) {
					chatDispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });
					chatDispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });

					if (chatState.currentConversation) {
						globalState.userSocket?.emit('kickUserFromChannel', {
							userToKick: user.id,
							roomName: chatState.currentConversation,
							roomID: chatState.currentConversationID,
						});
	
						globalState.userSocket?.emit('refreshUserChannelList', {
							userToRefresh: user.login,
						});
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
			console.log(error);
		}
	}

	const handleDms = async() => {

		try {

			const createDMConversationDto = {
				user1: Number(user.id),
				user2: Number(sessionStorage.getItem("currentUserID")),
			}
			const response = await fetch(`${process.env.API_URL}/chat/newDMConversation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(createDMConversationDto),
			});
	
			if (response.ok) {
				const conversation : Conversation = await response.json();
				let tmp = conversation.name;
				let conversationName = tmp.replace(me.login, "");
				chatDispatch({ type: 'SET_CURRENT_CONVERSATION', payload: user.login });
				chatDispatch({ type: 'SET_CURRENT_ROOM', payload: conversation.name });
				chatDispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });
				globalState.userSocket?.emit('joinRoom', { roomName: conversation.name, roomID: conversation.id } );
				globalState.userSocket?.emit('addUserToRoom', {
					convID: conversation.id,
					convName: conversation.name,
					friend: user.id,
				});
				globalState.userSocket?.emit('refreshUser', {
					userToRefresh: user.id,
					target: 'refreshDmList',
					status: true
				});
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
			console.log(error);
		}
		chatDispatch({ type: 'ACTIVATE', payload: 'showChat' });
		chatDispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });
		chatDispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
		chatDispatch({ type: 'DISABLE', payload: 'currentChannelBool' });
		chatDispatch({ type: 'DISABLE', payload: 'showChannel' });
		chatDispatch({ type: 'DISABLE', payload: 'showOptionsUserChannelOwner' });
	}

	const handleTabClick = (target: User) => {
		chatDispatch({ type: 'SET_CURRENT_TARGET', payload: target });
		chatDispatch({ type: 'ACTIVATE', payload: 'showConfirmation' });
		chatDispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
		chatDispatch({ type: 'DISABLE', payload: 'showOptionsUserChannelOwner' });
	};

	const handleCancel = () => {
		chatDispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
		chatDispatch({ type: 'DISABLE', payload: 'showOptionsUserChannelOwner' });
		chatDispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });		
		setFormValue('');
	};
		
	const handleRefreshOptionsUserChannel = () => {
		chatDispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
		chatDispatch({ type: 'DISABLE', payload: 'showOptionsUserChannelOwner' });
		chatDispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });	
	};

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				handleCancel();
			}
		};
		
		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, []);

	useEffect(() => {

		globalState.userSocket?.on('refreshOptionsUserChannel', () => {
			console.log("COucou je refresh les options");
			handleRefreshOptionsUserChannel();
		});
	
		return () => {
			globalState.userSocket?.off('refreshOptionsUserChannel');
		};

	  }, [globalState?.userSocket]);


	return (
		<>
		<div className="blur-background"></div>
			<img className="add_button_cancel" src='./close.png'  onClick={handleCancel}/>
			<div className="add_container">
				<h2 className="add__title">{user.login}</h2>	
				<div className="option-block">
					{user.id !== Number(sessionStorage.getItem("currentUserID")) && (
						<div>
							<img className='option-image' src="ping-pong.png" onClick={() => handleTabClick(user)}/>
							<img className="option-image" src="bulle.png" onClick={handleDms}/>
							{me.isAdmin && !user.isOwner &&
									<>
									{admin ? (
										<img className="option-image" src="couronne.png" onClick={demoteAdminUser}/>
									) : (
										<img className="option-image-opacity" src="couronne.png" onClick={promoteAdminUser}/>
									)}
									{mute ? (
										<img className="option-image" src="bouton-de-sourdine3.png" onClick={unmuteUser}/>
									) : (
											<img className="option-image-opacity" src="bouton-de-sourdine3.png" onClick={muteUser}/>
									)}
									{ban ? (
										<img className="option-image" src="interdire.png" onClick={unbanUser}/>
										) : (
										<img className="option-image-opacity" src="interdire.png" onClick={banUser}/>
										)}
									</>
							}
							{block ? (
								<img className="option-image" src="bloquer-un-utilisateur1.png" onClick={unblockUser}/>
								) : (
									<img className="option-image-opacity" src="bloquer-un-utilisateur1.png" onClick={blockUser}/>
								)}
						</div>
					)}
					{user.id !== me.id && !user.isOwner &&
						<img className="option-image" src="se-deconnecter1.png" onClick={handleKickChannel}/>}
					{user.id === me.id  &&
						<img className="option-image" src="se-deconnecter1.png" onClick={handleLeaveChannel}/>
					}
				</div>
			</div>
			{chatState.showConfirmation && (
				<ConfirmationComponent phrase={confirmationText} functionToExecute={funtionToExecute} />
			)}
		</>
	);
};

export default OptionsUserChannel;