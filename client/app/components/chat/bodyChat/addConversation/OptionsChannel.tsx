import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import './AddConversation.css';

interface OptionsChannelProps {
	name: string | null;
	title: string | null;
}

// interface user {
// 	login: string;
// 	avatarURL: string;
// 	isAdmin: boolean;
// 	isMute: boolean;
// 	isBan: boolean;
// }

const OptionsChannel: React.FC<OptionsChannelProps> = ({ name,  title }) => {

	const [formValue, setFormValue] = useState('');
	const { state, dispatch } = useChat();
	console.log('========>', name);
	const handleCancel = () => {
		dispatch({ type: 'DISABLE', payload: 'showOptionsChannel' });
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

	// const user = state.currentUserList.find((user: user) => user.login === name);
	// user.isAdmin = true;
	// user.isMute = false;
	// user.isBan = false;
	// console.log('user', user);
	return (
		<>
		<div className="blur-background"></div>
			<img className="add_button_cancel" src='./close.png'  onClick={handleCancel}/>
			<div className="add_container">
				<h2 className="add__title">{title}</h2>	
				<div className="option-block">
					{/* {user.isAdmin ?
						<img className="option-image" src="crown.png">
						 	admin
						</img>
						:
						<img className="option-image-opacity" src="crown.png">no admmin</img>
					}
					{user.isMute ?
						<img className="option-image" src="volume-mute.png">mute</img>
						:
						<img className="option-image-opacity" src="volume-mute.png">no mute </img>
					}
					{user.isBan ?
						<img className="option-image" src="interdit.png">ban</img>
						:
						<img className="option-image-opacity" src="interdit.png">no ban</img>
					} */}
				</div>
			</div>
		</>
	);
};

export default OptionsChannel;
