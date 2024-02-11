import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../../ChatContext';
import './AddConversation.css';
import { useGlobal } from '@/app/GlobalContext';
import { toast } from 'react-toastify';

interface OptionsChannelProps {
	title: string;
}

interface userList {
	id: number;
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
	const { chatState, chatDispatch } = useChat();
	if (chatState.currentUserList) {
		setMe(chatState.currentUserList.filter((user: userList) => user.id=== Number(sessionStorage.getItem("currentUserID"))));
	}
	if (me) {
		setIsAdmin(me[0].isAdmin);
		setIsOwner(me[0].isOwner);
	}


	const updateIsPublicTrue = async() => {

		try {
			const channelOptionDto = {
				conversationID: Number(chatState.currentConversationID),
				userID: Number(sessionStorage.getItem("currentUserID")),
			}

			const response = await fetch(`${process.env.API_URL}/chat/updateIsPublicTrue`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(channelOptionDto),
			});

			if (response.ok) {
				globalState.userSocket?.emit('refreshChannelList', {
					roomName : chatState.currentConversation,
					roomID: chatState.currentConversationID,
				});
				chatDispatch({ type: 'ACTIVATE', payload: 'currentConversationIsPrivate' });
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
	const updateIsPublicFalse = async() => {

		try {
			const channelOptionDto = {
				conversationID: Number(chatState.currentConversationID),
				userID: Number(sessionStorage.getItem("currentUserID")),
			}

			const response = await fetch(`${process.env.API_URL}/chat/updateIsPublicFalse`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(channelOptionDto),
			});

			if (response.ok) {
				globalState.userSocket?.emit('refreshChannelList', {
					roomName : chatState.currentConversation,
					roomID: chatState.currentConversationID,
				});
				chatDispatch({ type: 'DISABLE', payload: 'currentConversationIsPrivate' });
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

	const deleteChannel = async() => {

		try{
			const channelOptionDto = {
				conversationID: Number(chatState.currentConversationID),
				userID: Number(sessionStorage.getItem("currentUserID")),
			}
	
			const response = await fetch(`${process.env.API_URL}/chat/deleteConversation`, {
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
					roomName: chatState.currentConversation,
					roomID: chatState.currentConversationID,
				});
				chatDispatch({ type: 'DISABLE', payload: 'showOptionChannel' });
				chatDispatch({ type: 'DISABLE', payload: 'showChannel' });
				chatDispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });
				chatDispatch({ type: 'ACTIVATE', payload: 'showChannelList' });
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
	const updateIsProtectedFalse = async() => {


		try{
			const channelOptionDto = {
				conversationID: Number(chatState.currentConversationID),
				userID: Number(sessionStorage.getItem("currentUserID")),
				state: chatState.currentConversationIsProtected,
			}

			const response = await fetch(`${process.env.API_URL}/chat/updateIsProtectedFalse`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(channelOptionDto),
			});
	
			if (response.ok) {
					globalState.userSocket?.emit('refreshChannelList', {
						roomName : chatState.currentConversation,
						roomID: chatState.currentConversationID,
					});
					chatDispatch({ type: 'DISABLE', payload: 'currentConversationIsProtected' });
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

		chatDispatch({ type: 'DISABLE', payload: 'showOptionChannel' });
		chatDispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });
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

	useEffect(() => {
		globalState.userSocket?.on('channelDeleted', ( data: {roomName: string, roomID: string} ) => {
			chatDispatch({ type: 'ACTIVATE', payload: 'showChannelList' });
		});

		return () => {
			globalState.userSocket?.off('refreshChannelList');
		}
	}, [globalState?.userSocket]);

	return (
		<>
		<div className="blur-background"></div>
			<img className="add_button_cancel" src='./close.png'  onClick={handleCancel}/>
			<div className="add_container">
				<h2 className="add__title">{title}</h2>	
				<div className="option-block">
					{chatState.isAdmin ?
						<>
							{chatState.currentConversationIsPrivate ?
								<img className="option-image-opacity" src="oeil.png"  onClick={updateIsPublicFalse}/>
								:
								<img className="option-image" src="oeil.png" onClick={updateIsPublicTrue}/>
							}
							{chatState.currentConversationIsProtected &&
								<img className="option-image" src="changer-le-mot-de-passe.png"  onClick={() => { 
									if (chatState.currentConversationIsProtected)
										chatDispatch({ type: 'ACTIVATE', payload: 'showPasswordChange' });
										chatDispatch({ type: 'DISABLE', payload: 'showOptionChannel' });
								}}/>
							}
							{chatState.currentConversationIsProtected ?
								<img className="option-image" src="cadenas-verrouille1.png" onClick={updateIsProtectedFalse}/>
								:
								<img className="option-image-opacity" src="cadenas-verrouille1.png"
								onClick={() => { 
										chatDispatch({ type: 'ACTIVATE', payload: 'showPasswordChange' });
										chatDispatch({ type: 'DISABLE', payload: 'showOptionChannel' });
								}}/>}
						</> 
						:
						null
					}
					
					{chatState.isOwner &&
						<img className="option-image" src="corbeille1.png" onClick={() => deleteChannel() }/>}
				</div>
			</div>
		</>
	);
};

export default OptionsChannel;
