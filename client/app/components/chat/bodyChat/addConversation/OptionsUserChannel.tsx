import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
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
}
const OptionsUserChannel: React.FC<OptionsUserChannelProps> = ({ name,  title, user }) => {

	const [formValue, setFormValue] = useState('');
	const { state, dispatch } = useChat();
	console.log('========>', name);
	const handleCancel = () => {
		dispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
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

	const handleMute = async() => {
		try {
			const userOptionDto = {conversationID: state.currentConversationID, userID: state.currentUserID, state : user.isMute}
			const response = await fetch(`http://localhost:3001/chat/getMessages/muteUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(userOptionDto),
			});
	
			if (response.ok) {
				user.isMute = !user.isMute;
				console.log("Mute");
			}
			} catch (error) {
			console.log(error);
			}
	}

	const handleBan = async() => {
		try {
			const userOptionDto = {conversationID: state.currentConversationID, userID: state.currentUserID, state : user.isBan}
			const response = await fetch(`http://localhost:3001/chat/banUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(userOptionDto),
			});
	
			if (response.ok) {
				user.isBan = !user.isBan;
				console.log("Mute");
			}
			} catch (error) {
			console.log(error);
			}
	}

	const handleAdmin = async() => {
		try {
			const userOptionDto = {conversationID: state.currentConversationID, userID: state.currentUserID, state : user.isAdmin}
			const response = await fetch(`http://localhost:3001/chat/adminUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(userOptionDto),
			});
	
			if (response.ok) {
				user.isAdmin = !user.isAdmin;
				console.log("Mute");
			}
			} catch (error) {
			console.log(error);
			}
	}

	return (
		<>
		<div className="blur-background"></div>
			<img className="add_button_cancel" src='./close.png'  onClick={handleCancel}/>
			<div className="add_container">
				<h2 className="add__title">{title}</h2>	
				<div className="option-block">
					{user.isAdmin ?
						<img className="option-image" src="crown.png"/>
						:
						<img className="option-image-opacity" src="crown.png"/>
					}
					{user.isMute ?
						<img className="option-image" src="volume-mute.png"/>
						:
						<img className="option-image-opacity" src="volume-mute.png"/>
					}
					{user.isBan ?
						<img className="option-image" src="interdit.png"/>
						:
						<img className="option-image-opacity" src="interdit.png"/>
					}
				</div>
			</div>
		</>
	);
};

export default OptionsUserChannel;
