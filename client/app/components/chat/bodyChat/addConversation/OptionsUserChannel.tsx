import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { setCurrentComponent, useChat } from '../../ChatContext';
import { toast } from 'react-toastify';
import './AddConversation.css';
import { RSC } from 'next/dist/client/components/app-router-headers';
import { useGlobal } from '@/app/GlobalContext';

interface user {
	login: string;
	avatarURL: string;
	isAdmin: boolean;
	isMute: boolean;
	isBan: boolean;
	isBlock: boolean;
	id: number;
}

interface OptionsUserChannelProps {
	user: user
	me :user
}


const OptionsUserChannel: React.FC<OptionsUserChannelProps> = ({ user , me}) => {

	const { state, dispatch } = useChat();
	const { globalState } = useGlobal();
	const [formValue, setFormValue] = useState('');
	const [admin, setAdmin] = useState<boolean>(user.isAdmin);
	const [mute, setMute] = useState<boolean>(user.isMute);
	const [ban, setBan] = useState<boolean>(user.isBan);
	const [block, setBlock] = useState<boolean>(user.isBlock);


	const blockUser = async() => {

		try {
			const BlockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user.login,
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
			user.isBlock = !user.isBlock;
			setBlock(true);

			globalState.userSocket?.emit('joinRoom', { roomName: `whoblocked${user.login}`, roomID: '' } );
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
				recipientLogin: user.login,
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
			user.isBlock = !user.isBlock;
			setBlock(false);

			globalState.userSocket?.emit('leaveRoom', { roomName: `whoblocked${user.login}`, roomID: '' } );

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
				globalState.userSocket?.emit('banUser', { userToBan: user.login, roomName: state.currentConversation, roomID: state.currentConversationID } );
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
				globalState.userSocket?.emit('unbanUser', { userToUnban: user.login, roomName: state.currentConversation, roomID: state.currentConversationID } );
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
				globalState.userSocket?.emit('refreshUser', {
					userToRefresh: user.login,
					target: 'adminChange',
					status: true,
				});
				globalState.userSocket?.emit('refreshUserChannelList', {
					userToRefresh: user.login,
					roomName: state.currentConversation,
					roomID: state.currentConversationID,
				});
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
				globalState.userSocket?.emit('refreshUser', {
					userToRefresh: user.login,
					target: 'adminChange',
					status: false,
				});
				globalState.userSocket?.emit('refreshUserChannelList', {
					userToRefresh: user.login,
					roomName: state.currentConversation,
					roomID: state.currentConversationID,
				});
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
				dispatch({ type: 'ACTIVATE', payload: 'showChannelList' });
				dispatch({ type: 'DISABLE', payload: 'showChannel' });
				dispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
				globalState.userSocket?.emit('refreshUserChannelList', { userToRefresh: user.login, roomName: state.currentConversation, roomID: state.currentConversationID } );
			}
		}
		catch (error) {
			console.log(error);
		}
	}
	
	const handleDms = async() => {
		try {
			const createConversationDto = {
				initiatorID: Number(sessionStorage.getItem("currentUserID")),
				recipientID: user.id,
			}
			
			const response = await fetch(`http://localhost:3001/chat/createConversation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(createConversationDto),
			});
	
			if (response.ok) {
				const conversation = await response.json();
				dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
				dispatch({ type: 'SET_CURRENT_ROOM', payload: conversation.name });
				dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: conversation.id });
				dispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
				dispatch({ type: 'ACTIVATE', payload: 'showChat' });
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

	// Refresh handler
	// useEffect(() => {

	// 	globalState.userSocket.on('adminChange', (flag: boolean) => {
	// 		console.log("COUCOCUOCUOCUOCOCUCUOUCCU");
	// 		setAdmin(flag);
	// 	});

	// 	return () => {
	// 		globalState.userSocket?.off('adminChange');
	// 	}

	// }, [globalState?.userSocket]);

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
							{block ? (
								<img className="option-image" src="block.png" onClick={unblockUser}/>
							) : (
								<img className="option-image-opacity" src="block.png" onClick={blockUser}/>
							)}
						</div>
					)}
					<img className="option-image" src="logoutred.png" onClick={handleLeaveChannel}/>
				</div>
			</div>
		</>
	);
};

export default OptionsUserChannel;