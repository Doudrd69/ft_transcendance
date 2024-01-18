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
	const isAdmin = state.currentUserChannel?.isAdmin ?? false;
	const isOwner = state.currentUserChannel?.isOwner ?? false;
	const updateIsPublicTrue = async() => {

		try {
			const channelOptionDto = {
				conversationID: state.currentChannel?.id,
				userID: Number(sessionStorage.getItem("currentUserID")),
			}

			const response = await fetch(`http://localhost:3001/chat/updateIsPublicTrue`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(channelOptionDto),
			});

			if (response.ok) {
				console.log("Updated status");
				dispatch({
					type: 'SET_CURRENT_CHANNEL',
					payload: {
					  ...state.currentChannel,
					  isPublic: true,
					},
				  });
			}
		}
		catch (error) {
			console.error(error);
		}
	}
	const updateIsPublicFalse = async() => {

		try {
			const channelOptionDto = {
				conversationID: state.currentChannel?.id,
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
				dispatch({
					type: 'SET_CURRENT_CHANNEL',
					payload: {
						...state.currentChannel,
						isPublic: false,
					},
					});
			}
		}
		
		catch (error) {
			console.error(error);
		}
}

	const deleteChannel = async() => {

		try{
			const channelOptionDto = {
				conversationID: state.currentChannel?.id,
				userID: Number(sessionStorage.getItem("currentUserID")),
				state: state.currentChannel?.isPublic,
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
				console.log("Updated status");
				dispatch({
					type: 'SET_CURRENT_CHANNEL',
					payload: {
						...state.currentChannel,
						isProtected: true,
					},
				});
			}
		}
		catch (error) {
			console.error(error);
		}
}
	const updateIsProtectedFalse = async() => {


		try{
			const channelOptionDto = {
				conversationID: state.currentChannel?.id,
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
				if (status) {
					console.log("Updated status");
					dispatch({
						type: 'SET_CURRENT_CHANNEL',
						payload: {
							...state.currentChannel,
							isProtected: false,
						},
					});
				}
			}
		}
		catch (error) {
			console.error(error);
		}
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
							{state.currentChannel?.isPublic ?
								<img className="option-image" src="private.png"  onClick={updateIsPublicFalse}/>
								:
								<img className="option-image" src="public.png" onClick={updateIsPublicTrue}/>
							}
							{state.currentChannel?.isProtected ?
								<img className="option-image" src="upload-password.png"  onClick={() => { 
											dispatch({ type: 'ACTIVATE', payload: 'showPasswordChange' });
											dispatch({ type: 'DISABLE', payload: 'showOptionChannel' });
									}}/>
								:
								null
							}
							{state.currentChannel?.isProtected ?
								<img className="option-image" src="password.png" onClick={updateIsProtectedFalse}/>
								:
								<img className="option-image" src="no-password.png"
								onClick={() => { 
										dispatch({ type: 'ACTIVATE', payload: 'showPasswordChange'});
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
