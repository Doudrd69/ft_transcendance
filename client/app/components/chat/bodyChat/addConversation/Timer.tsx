import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import './AddConversation.css';
import { useGlobal } from '@/app/GlobalContext';
import { toast } from 'react-toastify';


interface User {
	id: number;
	login: string;
	avatarURL: string;
	isAdmin: boolean;
	isMute: boolean;
	isBan: boolean;
	isOwner: boolean;
}

interface TimerComponentProps {
	user: User;
}

const TimerComponent: React.FC<TimerComponentProps> = ({user}) => {
	

	const [timer, setTimer] = useState('');
	const { chatState, chatDispatch } = useChat();
	const { globalState } = useGlobal();
	const handleChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
			setTimer(e.target.value);
	}

	const handleTimerSubmit = async(e: React.FormEvent<HTMLFormElement>) => {

		e.preventDefault();
		try{
			const muteUserDto = {
				conversationID: Number(chatState.currentConversationID),
				username: chatState.currentTarget.login,
				state: true,
				from: Number(sessionStorage.getItem("currentUserID")),
				mutedUntil: Number(timer),
			}
			const response = await fetch(`${process.env.API_URL}/chat/muteUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(muteUserDto),
			});
		
			if (response.ok) {
				user.isMute = !user.isMute;
				if (chatState.currentConversation) {
					globalState.userSocket?.emit('emitNotification', {
						channel: chatState.currentConversation + chatState.currentConversationID,
						content: `${user.login} has been muted for ${timer} minutes`,
						channelID: chatState.currentConversationID,
					});
				}
				globalState.userSocket?.emit('refreshUserChannelList', {
					userToRefresh: user.login,
				});
				chatDispatch({ type: 'ACTIVATE' , payload: 'showBackComponent'});
				chatDispatch({ type: 'DISABLE' , payload: 'showTimer'});
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

	const handleCancel = () => {
		chatDispatch({ type: 'DISABLE' , payload: 'showTimer'});
		chatDispatch({ type: 'ACTIVATE' , payload: 'showOptionUserChannel'});
		chatDispatch({ type: 'ACTIVATE' , payload: 'showBackComponent'});
		setTimer('');
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
		<div className='blur-background-password'>
			<img className="add_button_cancel" src='./close.png'  onClick={handleCancel}/>
				<div className="password-form">
				<p style={{ textTransform: 'uppercase' }} className="text-password">MUTE {user.login} PENDANT</p>
				<form onSubmit={handleTimerSubmit}>
					<input
					type="input"
					name="timer"
					placeholder="temps en minute"
					value={timer}
					onChange={handleChange}
					/>
					<button type="submit">OK</button>
				</form>
			</div>

		</div>
	);
};

export default TimerComponent;
