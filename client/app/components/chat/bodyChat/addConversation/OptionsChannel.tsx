import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import './AddConversation.css';
import { useGlobal } from '@/app/GlobalContext';



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
	const [me, setMe] = useState<userList[]>();
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const { globalState } = useGlobal();
	const { state, dispatch } = useChat();
	if (state.currentUserList) {
		setMe(state.currentUserList.filter((user: userList) => user.login === sessionStorage.getItem("currentUserLogin")));
		console.log('me', me);
	}
	if (me) {
		setIsAdmin(me[0].isAdmin);
		setIsOwner(me[0].isOwner);
	}


	const updateIsPublicTrue = async() => {

		try {
			const channelOptionDto = {
				conversationID: Number(state.currentConversationID),
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
				dispatch({ type: 'ACTIVATE', payload: 'currentConversationIsPrivate' });
			}
		}
		catch (error) {
			console.error(error);
		}
	}
	const updateIsPublicFalse = async() => {

		try {
			const channelOptionDto = {
				conversationID: Number(state.currentConversationID),
				userID: Number(sessionStorage.getItem("currentUserID")),
			}

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
			}
		}
		catch (error) {
			console.error(error);
		}
}

	const deleteChannel = async() => {

		try{
			const channelOptionDto = {
				conversationID: Number(state.currentConversationID),
				userID: Number(sessionStorage.getItem("currentUserID")),
			}
	
			const response = await fetch(`http://localhost:3001/chat/deleteConversation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(channelOptionDto),
			});
	
			if (response.ok) {

				// makes everyone in the channel leave + refresh component
				globalState.userSocket?.emit('deleteChannel', {
					roomName: state.currentConversation,
					roomID: state.currentConversationID,
				});

				dispatch({ type: 'DISABLE', payload: 'showOptionChannel' });
				dispatch({ type: 'DISABLE', payload: 'showChannel' });
				dispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });
				dispatch({ type: 'ACTIVATE', payload: 'showChannelList' });
			}
		}
		catch (error) {
			console.error(error);
		}
}
	const updateIsProtectedFalse = async() => {


		try{
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
				if (status) {
					dispatch({ type: 'DISABLE', payload: 'currentConversationIsProtected' });
				}
				else {
					console.log("User is not admin on this channel");
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
					{state.isAdmin ?
						<>
							{state.currentConversationIsPrivate ?
								<img className="option-image" src="private.png"  onClick={updateIsPublicFalse}/>
								:
								<img className="option-image" src="public.png" onClick={updateIsPublicTrue}/>
							}
							{state.currentConversationIsProtected &&
								<img className="option-image" src="upload-password.png"  onClick={() => { 
									if (state.currentConversationIsProtected)
										dispatch({ type: 'ACTIVATE', payload: 'showPasswordChange' });
										dispatch({ type: 'DISABLE', payload: 'showOptionChannel' });
								}}/>
							}
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
					
					{state.isOwner &&
						<img className="option-image" src="closered.png" onClick={() => deleteChannel() }/>}
				</div>
			</div>
		</>
	);
};

export default OptionsChannel;
