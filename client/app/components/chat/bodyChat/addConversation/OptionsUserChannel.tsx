import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import { toast } from 'react-toastify';
import './AddConversation.css';

interface user {
	login: string;
	avatarURL: string;
	isAdmin: boolean;
	isMute: boolean;
	isBan: boolean;
	isBlock: boolean;
}

interface OptionsUserChannelProps {
	user: user
	userSocket: Socket,
}

const OptionsUserChannel: React.FC<OptionsUserChannelProps> = ({ user, userSocket }) => {

	const [formValue, setFormValue] = useState('');
	const { state, dispatch } = useChat();
	const [admin, setAdmin] = useState<boolean>(user.isAdmin);
	const [mute, setMute] = useState<boolean>(user.isMute);
	const [ban, setBan] = useState<boolean>(user.isBan);
	const [block, setBlock] = useState<boolean>(user.isBlock);


	const blockUser = async() => {

		const BlockUserDto = {
			initiatorLogin: sessionStorage.getItem("currentUserLogin"),
			recipientLogin: user.login,
		}

		console.log("dto++> ", BlockUserDto);

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

			console.log("block");
		}
		else {
			console.error("Fatal error");
		}
	}
	
	const unblockUser = async() => {

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

			console.log("unblock");
		}
		else {
			console.error("Fatal error");
		}
	}

	const unmuteUser = async() => {

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
			console.log("unMute");
		}
		else {
			console.error("Fatal error");
		}
	}
	
	const muteUser = async() => {

		const userOptionDto = {
			conversationID: Number(state.currentConversationID),
			username: user.login,
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
		else {
			console.error("Fatal error");
		}
	}

	const banUser = async() => {

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
			if (status) {
				userSocket.emit('banUser', { userToBan: user.login, roomName: state.currentConversation, roomID: state.currentConversationID } );
			}
			else
				userSocket.emit('unbanUser', { userToUnban: user.login, roomName: state.currentConversation, roomID: state.currentConversationID } );
		}
		else {
			console.error("Fatal error");
		}
	}

	const unbanUser = async() => {

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
			if (status) {
				userSocket.emit('banUser', { userToBan: user.login, roomName: state.currentConversation, roomID: state.currentConversationID } );
			}
			else
				userSocket.emit('unbanUser', { userToUnban: user.login, roomName: state.currentConversation, roomID: state.currentConversationID } );
		}
		else {
			console.error("Fatal error");
		}
	}
	
	
	const promoteAdminUser = async() => {
		
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
			setAdmin(true);
		}
		else {
			console.error("Fatal error");
		}
	}

	const demoteAdminUser = async() => {
		
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

			setAdmin(false);
		}
		else {
			console.error("Fatal error");
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
					{block ?
						<img className="option-image" src="block.png" onClick={unblockUser}/>
						:
						<img className="option-image-opacity" src="block.png" onClick={blockUser}/>
					}
				</div>
			</div>
		</>
	);
};

export default OptionsUserChannel;