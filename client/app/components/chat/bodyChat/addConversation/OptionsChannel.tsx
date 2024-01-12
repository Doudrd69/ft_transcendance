import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import './AddConversation.css';

interface User {
	login: string;
	avatarURL: string;
	isAdmin: boolean;
	isMute: boolean;
	isBan: boolean;
}

interface OptionsChannelProps {
	title: string;
}

interface Conversation {
	isPrivate: boolean;
	isProtected: boolean;
}

const OptionsChannel: React.FC<OptionsChannelProps> = ({title}) => {

	const [formValue, setFormValue] = useState('');
	const { state, dispatch } = useChat();

	const handleCancel = () => {
		dispatch({ type: 'DISABLE', payload: 'showOptionChannel' });
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
					{/* {conversation.isPrivate ?
						<img className="option-image" src="crown.png">
						 	admin
						</img>
						:
						<img className="option-image-opacity" src="crown.png">no admmin</img>
					}
					{Conversation.isProtected ?
						<img className="option-image" src="volume-mute.png">mute</img>
						:
						<img className="option-image-opacity" src="volume-mute.png">no mute </img>
					} */}
				</div>
			</div>
		</>
	);
};

export default OptionsChannel;
