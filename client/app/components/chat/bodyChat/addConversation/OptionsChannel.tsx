import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import './AddConversation.css';



interface OptionsChannelProps {
	title: string;
}

interface userList {
	login: string;
	avatarURL: string;
	isAdmin: boolean;
	isMute: boolean;
	isBan: boolean;
	isOwner: boolean;
}

const OptionsChannel: React.FC<OptionsChannelProps> = ({title}) => {

	const [formValue, setFormValue] = useState('');
	const { state, dispatch } = useChat();

	const handlePrivate = async() => {

			const channelOptionDto = {
				conversationID: Number(state.currentConversationID),
				userID: Number(sessionStorage.getItem("currentUserID")),
				state: state.currentConversationIsPrivate,
			}
			console.log("HANDLE PRIVATE: ", channelOptionDto);

			const response = await fetch(`http://localhost:3001/chat/updateIsPublic`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(channelOptionDto),
			});

			if (response.ok) {
				dispatch({ type: 'TOGGLEX', payload: 'currentConversationIsPrivate' });
				console.log("Updated status");
			}
			else {
				console.log("Fatal error");
			}
	}

	const handleleaveChannel = async() => {

		const channelOptionDto = {
			conversationID: Number(state.currentConversationID),
			userID: Number(sessionStorage.getItem("currentUserID")),
			state: state.currentConversationIsPrivate,
		}

		console.log("HANDLE PRIVATE: ", channelOptionDto);
		const response = await fetch(`http://localhost:3001/chat/updateIsPublic`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			},
			body: JSON.stringify(channelOptionDto),
		});

		if (response.ok) {
			dispatch({ type: 'TOGGLEX', payload: 'currentConversationIsPrivate' });
			console.log("Updated status");
		}
		else {
			console.log("Fatal error");
		}
}
	const handleProtected = async() => {

		// error Error: Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.
			const channelOptionDto = {
				conversationID: Number(state.currentConversationID),
				userID: Number(sessionStorage.getItem("currentUserID")),
				state: state.currentConversationIsProtected,
				password: formValue,
		
			}

			const response = await fetch(`http://localhost:3001/chat/updateIsProtected`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(channelOptionDto),
			});
	
			if (response.ok) {
				const status = await response.json();
				console.log(status);
				if (status) {
					dispatch({ type: 'TOGGLEX', payload: 'currentConversationIsProtected' });
					console.log("Password updated");
				}
				else {
					console.log("User is not admin on this channel");
				}
			}
			else {
				console.log("Fatal error");
			}

			return ;
	}

	const handleCancel = () => {
		dispatch({ type: 'DISABLE', payload: 'showOptionChannel' });
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

	const me = state.currentUserList.filter((user: userList) => user.login === sessionStorage.getItem("currentUserLogin"));
	const isAdmin = me[0].isAdmin;
	console.log("me: ", me);
	console.log("me.isAdmin: ", me[0].isAdmin);

	return (
		<>
		<div className="blur-background"></div>
			<img className="add_button_cancel" src='./close.png'  onClick={handleCancel}/>
			<div className="add_container">
				<h2 className="add__title">{title}</h2>	
				<div className="option-block">
					{isAdmin ?
						<>
							{state.currentConversationIsPrivate ?
								<img className="option-image" src="private.png"  onClick={handlePrivate}/>
								:
								<img className="option-image" src="public.png" onClick={handlePrivate}/>
							}
							<img className="option-image" src="upload-password.png"  onClick={() => { 
									if (state.currentConversationIsProtected)
										dispatch({ type: 'ACTIVATE', payload: 'showPasswordChange' });
										dispatch({ type: 'DISABLE', payload: 'showOptionChannel' });
							}}/>
							{state.currentConversationIsProtected ?
								<img className="option-image" src="password.png" onClick={handleProtected}/>
								:
								<img className="option-image" src="no-password.png" 
								onClick={() => { 
										dispatch({ type: 'ACTIVATE', payload: 'showPasswordChange' });
										dispatch({ type: 'DISABLE', payload: 'showOptionChannel' });
							}}/>}
						</> 
						:
						null
					}
					<img className="option-image" src="logoutred.png" onClick={() => { 
								{handleleaveChannel}
								dispatch({ type: 'DISABLE', payload: 'showOptionChannel' });

					}}/>
				</div>
			</div>
		</>
	);
};

export default OptionsChannel;
