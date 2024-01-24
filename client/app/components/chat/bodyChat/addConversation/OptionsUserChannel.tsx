import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { setCurrentComponent, useChat } from '../../ChatContext';
import './AddConversation.css';
import { RSC } from 'next/dist/client/components/app-router-headers';
import { useGlobal } from '@/app/GlobalContext';

interface User {
	id: number;
	login: string;
	avatarURL: string;
	isAdmin: boolean;
	isMute: boolean;
	isBan: boolean;
	isOwner: boolean;
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

	const { state, dispatch } = useChat();
	const { globalState } = useGlobal();
	const [formValue, setFormValue] = useState('');
	const [admin, setAdmin] = useState<boolean>(user.isAdmin);
	const [mute, setMute] = useState<boolean>(user.isMute);
	const [ban, setBan] = useState<boolean>(user.isBan);
	const unmuteUser = async() => {

		try {
			const userOptionDto = {
				conversationID: Number(state.currentConversationID),
				username: user.login,
				state: false,
				from: Number(sessionStorage.getItem("currentUserID"))
			}
	
			const response = await fetch(`http://localhost:3001/chat/unmuteUser`, {
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
			}
		}
		catch (error) {
			console.error(error);
		}
	}
	
	const muteUser = async() => {

		try{
			const muteUserDto = {
				conversationID: Number(state.currentConversationID),
				username: user.login,
				state: true,
				from: Number(sessionStorage.getItem("currentUserID")),
				mutedUntil: 5,
			}
	
			const response = await fetch(`http://localhost:3001/chat/muteUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(muteUserDto),
			});
		
			if (response.ok) {
				user.isMute = !user.isMute;
				setMute(true);
				console.log("Mute");
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const banUser = async() => {

		try{


			const userOptionDto = {
				conversationID: Number(state.currentConversationID),
				username: user.login,
				state : true,
				from: Number(sessionStorage.getItem("currentUserID"))
			}
	
			const response = await fetch(`http://localhost:3001/chat/banUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(userOptionDto),
			});
		
			if (response.ok) {
				console.log("ban");
				const status = await response.json();
				user.isBan = !user.isBan;
				setBan(true);

				globalState.userSocket?.emit('banUser', {
					userToBan: user.login,
					roomName: state.currentConversation,
					roomID: state.currentConversationID
				});

			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const unbanUser = async() => {

		try {

			const userOptionDto = {
				conversationID: Number(state.currentConversationID),
				username: user.login,
				state : false,
				from: Number(sessionStorage.getItem("currentUserID"))
			}
	
			const response = await fetch(`http://localhost:3001/chat/unbanUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(userOptionDto),
			});
		
			if (response.ok) {
				console.log("unban");
				const status = await response.json();
				user.isBan = !user.isBan;
				setBan(false);

				globalState.userSocket?.emit('unbanUser', {
					userToUnban: user.login,
					roomName: state.currentConversation,
					roomID: state.currentConversationID
				});

			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const promoteAdminUser = async() => {
		
		try {
			const userOptionDto = {
				conversationID: Number(state.currentConversationID),
				username: user.login,
				state : true,
				from: Number(sessionStorage.getItem("currentUserID"))
			}
	
			const response = await fetch(`http://localhost:3001/chat/promoteAdminUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(userOptionDto),
			});
		
			if (response.ok) {
				user.isAdmin = !user.isAdmin;
				console.log("Promote");

				if (state.currentConversation) {
					globalState.userSocket?.emit('refreshChannel', {
						channel: state.currentConversation + state.currentConversationID,
					});
	
					// refresh channel list for userToRefresh (who has been promoted)
					globalState.userSocket?.emit('refreshUserChannelList', {
						userToRefresh: user.login,
						roomName: state.currentConversation,
						roomID: state.currentConversationID,
					});
				}

				setAdmin(true);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const demoteAdminUser = async() => {
		
		try{

			const userOptionDto = {
				conversationID: Number(state.currentConversationID),
				username: user.login,
				state : false,
				from: Number(sessionStorage.getItem("currentUserID"))
			}
	
			const response = await fetch(`http://localhost:3001/chat/demoteAdminUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(userOptionDto),
			});
			if (response.ok) {
				console.log("demote");
				user.isAdmin = !user.isAdmin;

				if (state.currentConversation) {
					globalState.userSocket?.emit('refreshChannel', {
						channel: state.currentConversation + state.currentConversationID,
					});
	
					// refresh channel list for userToRefresh (who has been promoted)
					globalState.userSocket?.emit('refreshUserChannelList', {
						userToRefresh: user.login,
						roomName: state.currentConversation,
						roomID: state.currentConversationID,
					});
				}

				setAdmin(false);
			}
		}
		catch (error) {
			console.error(error);
		}
	}
	
	const handleLeaveChannel = async() => {
		try {
			const quitlConversationDto = {
					conversationID: Number(state.currentConversationID),
					userID: user.id,
			}
	
			const response = await fetch(`http://localhost:3001/chat/quitConversation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(quitlConversationDto),
			});
	
			if (response.ok) {
				console.log(me);
				console.log(user);
				if (user.login == me.login)
				{
					// je quitte le channel donc faut refresh le composant pour les autres
					dispatch({ type: 'ACTIVATE', payload: 'showChannelList' });
					dispatch({ type: 'DISABLE', payload: 'showChannel' });

					if (state.currentConversation) {
						globalState.userSocket?.emit('refreshChannel', {
							channel: state.currentConversation + state.currentConversationID,
						});
						globalState.userSocket?.emit('leaveRoom', {
							roomName: state.currentConversation,
							roomID: state.currentConversationID,
						});
					}
				}
				else {
					// je kick un user donc faut refresh le composant pour les autres
					dispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });
					dispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });

					// refresh channel for all users inside
					if (state.currentConversation) {
						globalState.userSocket?.emit('refreshChannel', {
							channel: state.currentConversation + state.currentConversationID,
						});
						// permet au user kick de leave la room
						globalState.userSocket?.emit('kickUserFromChannel', {
							userToKick: user.login,
							roomName: state.currentConversation,
							roomID: state.currentConversationID,
						});
	
						globalState.userSocket?.emit('refreshUserChannelList', {
							userToRefresh: user.login,
							roomName: state.currentConversation,
							roomID: state.currentConversationID,
						});
					}
				}
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
			
			console.log(createDMConversationDto);
			const response = await fetch(`http://localhost:3001/chat/newDMConversation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(createDMConversationDto),
			});
	
			if (response.ok) {
				const conversation : Conversation = await response.json();
				console.log(conversation);
				console.log(conversation.name);
				
				dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
				dispatch({ type: 'SET_CURRENT_ROOM', payload: conversation.name });
				dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });
				
				// Current user joins the room
				globalState.userSocket?.emit('joinRoom', { roomName: conversation.name, roomID: conversation.id } );
				// Emit to the targeted user so he joins the room
				globalState.userSocket?.emit('addUserToRoom', {
					convID: conversation.id,
					convName: conversation.name,
					friend: user.login,
				});
				// Emit to refresh DM list
				globalState.userSocket?.emit('refreshUser', {
					userToRefresh: user.login,
					target: 'refreshDmList',
					status: true
				});
				
				// dispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
				// dispatch({ type: 'DISABLE', payload: 'showOptionsUserChannelOwner' });
				// dispatch({ type: 'DISABLE', payload: 'showChannel' });
				// dispatch({ type: 'ACTIVATE', payload: 'showChat' });

				console.log("Conversation created");
			}
		}
		catch (error) {
			console.log(error);
		}
	}

	const handleCancel = () => {
		dispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
		dispatch({ type: 'DISABLE', payload: 'showOptionsUserChannelOwner' });
		dispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });		
		setFormValue('');
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

	return (
		<>
		<div className="blur-background"></div>
			<img className="add_button_cancel" src='./close.png'  onClick={handleCancel}/>
			<div className="add_container">
				<h2 className="add__title">{user.login}</h2>	
				<div className="option-block">
					{user.login !== sessionStorage.getItem("currentUserLogin") && (
						<div>
							<img className="option-image" src="chat.png" onClick={handleDms}/>
							{me.isAdmin && (
									<>
									{admin ? (
										<img className="option-image" src="crown.png" onClick={demoteAdminUser}/>
									) : (
										<img className="option-image-opacity" src="crown.png" onClick={promoteAdminUser}/>
									)}
									{mute ? (
										<img className="option-image" src="volume-mute.png" onClick={unmuteUser}/>
									) : (
										<img className="option-image" src="unmute.png" onClick={muteUser}/>
									)}
									{ban ? (
										<img className="option-image" src="interdit.png" onClick={unbanUser}/>
									) : (
										<img className="option-image-opacity" src="interdit.png" onClick={banUser}/>
									)}
									</>
								)
							}
							{/* {block ? (
								<img className="option-image" src="block.png" onClick={unblockUser}/>
							) : (
								<img className="option-image-opacity" src="block.png" onClick={blockUser}/>
							)} */}
						</div>
					)}
					<img className="option-image" src="logoutred.png" onClick={handleLeaveChannel}/>
				</div>
			</div>
		</>
	);
};

export default OptionsUserChannel;