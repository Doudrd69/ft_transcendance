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

	console.log("Name: ", name);
	const handleMute = async() => {

		const userOptionDto = {conversationID: Number(state.currentConversationID), username: user.login , state: user.isMute}
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
			console.log("Mute");
		}
		else {
			console.error("Fatal error");
		}
	}
	
	const handleBan = async() => {

		const userOptionDto = {conversationID: Number(state.currentConversationID), username: user.login, state : user.isBan}
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
			console.log("ban");
		}
		else {
			console.error("Fatal error");
		}
	}
		
	const handleAdmin = async() => {

		console.log("Name: ", name);

		const userOptionDto = {conversationID: Number(state.currentConversationID), username: name, state : user.isAdmin}
		console.log("DTO --> ", userOptionDto);
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
			console.log("admin");
		}
		else {
			console.error("Fatal error");
		}
	}

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
	
	return (
		<>
		<div className="blur-background"></div>
			<img className="add_button_cancel" src='./close.png'  onClick={handleCancel}/>
			<div className="add_container">
				<h2 className="add__title">{title}</h2>	
				<div className="option-block">
					{user.isAdmin ?
						<img className="option-image" src="crown.png" onClick={handleAdmin}/>
						:
						<img className="option-image-opacity" src="crown.png" onClick={handleAdmin}/>
					}
					{user.isMute ?
						<img className="option-image" src="volume-mute.png" onClick={handleMute}/>
						:
						<img className="option-image-opacity" src="volume-mute.png" onClick={handleMute}/>
					}
					{user.isBan ?
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