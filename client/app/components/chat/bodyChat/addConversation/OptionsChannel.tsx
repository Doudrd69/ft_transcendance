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
	const me = state.currentUserList.filter((user: userList) => user.login === sessionStorage.getItem("currentUserLogin"));
	const isAdmin = me[0].isAdmin;
	const isOwner = me[0].isOwner;


	const updateIsPublicTrue = async() => {

			const channelOptionDto = {
				conversationID: Number(state.currentConversationID),
				userID: Number(sessionStorage.getItem("currentUserID")),
			}
			console.log("HANDLE PRIVATE: ", channelOptionDto);

			const response = await fetch(`http://localhost:3001/chat/updateIsPublicTrue`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(channelOptionDto),
			});

			if (response.ok) {
				dispatch({ type: 'ACTIVATE', payload: 'currentConversationIsPrivate' });
				console.log("Updated status");
			}
			else {
				console.log("Fatal error");
			}
	}
	const updateIsPublicFalse = async() => {

		const channelOptionDto = {
			conversationID: Number(state.currentConversationID),
			userID: Number(sessionStorage.getItem("currentUserID")),
		}
		console.log("HANDLE PRIVATE: ", channelOptionDto);

		const response = await fetch(`http://localhost:3001/chat/updateIsPublicFalse`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			},
			body: JSON.stringify(channelOptionDto),
		});

		if (response.ok) {
			dispatch({ type: 'DISABLE', payload: 'currentConversationIsPrivate' });
			console.log("Updated status");
		}
		else {
			console.log("Fatal error");
		}
}

	const deleteChannel = async() => {

		const channelOptionDto = {
			conversationID: Number(state.currentConversationID),
			userID: Number(sessionStorage.getItem("currentUserID")),
			state: state.currentConversationIsPrivate,
		}

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
	const updateIsProtectedTrue = async() => {
			const channelOptionDto = {
				conversationID: Number(state.currentConversationID),
				userID: Number(sessionStorage.getItem("currentUserID")),
				state: state.currentConversationIsProtected,
				password: formValue,
		
			}

			const response = await fetch(`http://localhost:3001/chat/updateIsProtectedTrue`, {
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
					dispatch({ type: 'ACTIVATE', payload: 'currentConversationIsProtected' });
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

	const updateIsProtectedFalse = async() => {

		// error Error: Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.
			const channelOptionDto = {
				conversationID: Number(state.currentConversationID),
				userID: Number(sessionStorage.getItem("currentUserID")),
				state: state.currentConversationIsProtected,
			}

			const response = await fetch(`http://localhost:3001/chat/updateIsProtectedFalse`, {
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
					dispatch({ type: 'DISABLE', payload: 'currentConversationIsProtected' });
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
								<img className="option-image" src="private.png"  onClick={updateIsPublicFalse}/>
								:
								<img className="option-image" src="public.png" onClick={updateIsPublicTrue}/>
							}
							<img className="option-image" src="upload-password.png"  onClick={() => { 
									if (state.currentConversationIsProtected)
										dispatch({ type: 'ACTIVATE', payload: 'showPasswordChange' });
										dispatch({ type: 'DISABLE', payload: 'showOptionChannel' });
							}}/>
							{state.currentConversationIsProtected ?
								<img className="option-image" src="password.png" onClick={updateIsProtectedFalse}/>
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
					
					{isOwner &&
					<img className="option-image" src="closered.png" onClick={() => { 
								{deleteChannel}
								dispatch({ type: 'DISABLE', payload: 'showOptionUseChannel' });

					}}/>}
				</div>
			</div>
		</>
	);
};

export default OptionsChannel;
