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
}

interface OptionsUserChannelProps {
	name: string | null;
	title: string | null;
	user: user
	userSocket: Socket,
}

const OptionsUserChannel: React.FC<OptionsUserChannelProps> = ({ name,  title, user, userSocket }) => {

	const [formValue, setFormValue] = useState('');
	const { state, dispatch } = useChat();
	const [admin, setAdmin] = useState<boolean>(user.isAdmin);
	const [mute, setMute] = useState<boolean>(user.isMute);
	const [ban, setBan] = useState<boolean>(user.isBan);

	const handleMute = async() => {

		const userOptionDto = {
			conversationID: Number(state.currentConversationID),
			username: user.login,
			state: user.isMute,
			from: Number(sessionStorage.getItem("currentUserID")),
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
			const responseData = await response.json();
			setAdmin(responseData);
			console.log("Mute");
		}
		else {
			console.error("Fatal error");
		}
	}
	
	const handleBan = async() => {

		const userOptionDto = {
			conversationID: Number(state.currentConversationID),
			username: user.login,
			state : user.isBan,
			from: Number(sessionStorage.getItem("currentUserID")),
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
			const status = await response.json();
			user.isBan = !user.isBan;
			console.log("Ban status: ", user.isBan);
			console.log("User to ban/unban: ", user.login);
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
	
	const handleAdmin = async() => {
		
		const userOptionDto = {
			conversationID: Number(state.currentConversationID),
			username: name,
			state : user.isAdmin,
			from: Number(sessionStorage.getItem("currentUserID")),
		}

		const response = await fetch(`http://localhost:3001/chat/adminUser`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			},
			body: JSON.stringify(userOptionDto),
		});
	
		if (response.ok) {
			const responseData = await response.json();
			setAdmin(responseData);
			console.log("userisAdmin", user.login);
			console.log("userisAdmin", user.isAdmin);
			console.log("Admin", admin);
		}
		else {
			console.error("Fatal error");
		}
	}

	const handleCancel = () => {
		dispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
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
				<h2 className="add__title">{title}</h2>	
				<div className="option-block">
					{admin ?
						<img className="option-image" src="crown.png" onClick={handleAdmin}/>
						:
						<img className="option-image-opacity" src="crown.png" onClick={handleAdmin}/>
					}
					{mute ?
						<img className="option-image" src="volume-mute.png" onClick={handleMute}/>
						:
						<img className="option-image-opacity" src="volume-mute.png" onClick={handleMute}/>
					}
					{ban ?
						<img className="option-image" src="interdit.png" onClick={handleBan}/>
						:
						<img className="option-image-opacity" src="interdit.png" onClick={handleBan}/>
					}
				</div>
			</div>
		</>
	);
};

export default OptionsUserChannel;
