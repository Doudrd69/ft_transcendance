import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import { toast } from 'react-toastify';
import './AddConversation.css';
import { RSC } from 'next/dist/client/components/app-router-headers';
import { useGlobal } from '@/app/GlobalContext';
import { UserChannel } from '../../types';

interface OptionsUserChannelProps {
	user: UserChannel;
	isBlock: boolean;
}


const OptionsUserChannel: React.FC<OptionsUserChannelProps> = ({user, isBlock}) => {

	const { state, dispatch } = useChat();
	const { globalState } = useGlobal();
	const [formValue, setFormValue] = useState('');
	const [admin, setAdmin] = useState<boolean>(user.isAdmin);
	const [mute, setMute] = useState<boolean>(user.isMute);
	const [ban, setBan] = useState<boolean>(user.isBan);

	const blockUser = async() => {

		try {
			const BlockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user.username,
			}
	
			const response = await fetch(`http://localhost:3001/users/blockUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(BlockUserDto),
			});
		
		if (response.ok) {
			globalState.userSocket?.emit('joinRoom', { roomName: `whoblocked${user.username}`, roomID: '' } );
		}
		}
		catch (error) {
			console.error(error);
		}
	}
	
	const unblockUser = async() => {

		try {

			const BlockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user.username,
			}
				const response = await fetch(`http://localhost:3001/users/unblockUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(BlockUserDto),
			});
		
		if (response.ok) {

			globalState.userSocket?.emit('leaveRoom', { roomName: `whoblocked${user.username}`, roomID: ''});

			console.log("unblock");
		}
		}
		catch (error) {
			console.error(error);
		}
	}

	const unmuteUser = async() => {

		try {
			const userOptionDto = {
				conversationID: Number(state.currentChannel?.id),
				username: user.username,
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
			const userOptionDto = {
				conversationID: Number(state.currentChannel?.id),
				username: user.username,
				state: true,
				from: Number(sessionStorage.getItem("currentUserID"))
			}
	
			const response = await fetch(`http://localhost:3001/chat/muteUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(userOptionDto),
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
				conversationID: Number(state.currentChannel?.id),
				username: user.username,
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
				globalState.userSocket?.emit('banUser', { userToBan: user.username, roomName: state.currentConversation, roomID: state.currentConversationID } );
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const unbanUser = async() => {

		try {

			const userOptionDto = {
				conversationID: Number(state.currentChannel?.id),
				username: user.username,
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
				globalState.userSocket?.emit('unbanUser', { userToUnban: user.username, roomName: state.currentConversation, roomID: state.currentConversationID } );
			}
		}
		catch (error) {
			console.error(error);
		}
	}
	
	
	const promoteAdminUser = async() => {
		
		try {
			const userOptionDto = {
				conversationID: Number(state.currentChannel?.id),
				username: user.username,
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
				conversationID: Number(state.currentChannel?.id),
				username: user.username,
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
				setAdmin(false);
			}
		}
		catch (error) {
			console.error(error);
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

	const handleLeaveChannel = async() => {
		try {
			const quitlConversationDto = {
				conversationID: Number(state.currentChannel?.id),
					userID: user.UserId,
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
				dispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });
				dispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
				console.log("Updated status");
			}
		}
		catch (error) {
			console.log(error);
		}
	}
  
	return (
		<>
		<div className="blur-background"></div>
			<img className="add_button_cancel" src='./close.png'  onClick={handleCancel}/>
			<div className="add_container">
				<h2 className="add__title">{user.username}</h2>	
				<div className="option-block">
					{admin ?
						<img className="option-image" src="crown.png" onClick={demoteAdminUser}/>
						:
						<img className="option-image-opacity" src="crown.png" onClick={promoteAdminUser}/>
					}
					{mute ?
						<img className="option-image" src="volume-mute.png" onClick={unmuteUser}/>
						:
						<img className="option-image" src="unmute.png" onClick={muteUser}/>
					}
					{ban ?
						<img className="option-image" src="interdit.png" onClick={unbanUser}/>
						:
						<img className="option-image-opacity" src="interdit.png" onClick={banUser}/>
					}
					{isBlock ?
						<img className="option-image" src="block.png" onClick={unblockUser}/>
						:
						<img className="option-image-opacity" src="block.png" onClick={blockUser}/>
					}
					<img className="option-image" src="logoutred.png" onClick={handleLeaveChannel}/>
				</div>
			</div>
		</>
	);
};

export default OptionsUserChannel;