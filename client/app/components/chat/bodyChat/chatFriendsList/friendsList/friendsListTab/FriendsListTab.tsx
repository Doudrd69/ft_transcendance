import { useGlobal } from '@/app/GlobalContext';
import { useChat } from '@/app/components/chat/ChatContext';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Socket, io } from 'socket.io-client';
import ListMyChannelComponent from '../../../listMyChannel/ListMyChannel';
import { io, Socket } from 'socket.io-client';
import { handleWebpackExternalForEdgeRuntime } from 'next/dist/build/webpack/plugins/middleware-plugin';
import { setGameSocket, useGlobal } from '@/app/GlobalContext';
import { ToastContainer, toast } from 'react-toastify';
import { globalAgent } from 'http';
import AddFriendComponent from '../../../addConversation/AddFriends';
import GameInviteComponent from '../../../chatChannel/gameInvite';
import GameInviteFunction from '../../../chatChannel/gameInvite';
import ConfirmationComponent from '../../confirmation/Confirmation';
import './FriendsListTab.css';

interface User {
	id: number;
	username: string;
	isBlocked: boolean;
}

interface FriendsListTabComponentProps {
	user: User;
	all: boolean
}

const FriendsListTabComponent: React.FC<FriendsListTabComponentProps> = ({ user, all }) => {

	const { chatState, chatDispatch } = useChat();
	const { globalState, dispatch } = useGlobal();
	const [gameSocketConnected, setgameSocketConnected] = useState<boolean>(false);
	const [gameInviteValidation, setgameInviteValidation] = useState<boolean>(false);
	const [confirmationText, setConfirmationText] = useState('');
	const [funtionToExecute, setFunctionToExecute] = useState<() => void>(() => { });
	const [accepted, setAccepted] = useState(false);

	const blockUser = async () => {

		try {

			const BlockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user.username,
			}

			const response = await fetch(`${process.env.API_URL}/users/blockUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(BlockUserDto),
			});

			if (response.ok) {
				user.isBlocked = true;
				chatDispatch({ type: 'DISABLE', payload: 'showConfirmation' })
				globalState.userSocket?.emit('joinRoom', { roomName: `whoblocked${user.username}`, roomID: '' });
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

	const unblockUser = async () => {

		try {
			const BlockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user.username,
			}
			const response = await fetch(`${process.env.API_URL}/users/unblockUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(BlockUserDto),
			});

			if (response.ok) {
				user.isBlocked = false;

				globalState.userSocket?.emit('leaveRoom', { roomName: `whoblocked${user.username}`, roomID: '' });
				chatDispatch({ type: 'DISABLE', payload: 'showConfirmation' })
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

	const handleTabClick = (text: string, functionToExecute: any) => {
		setConfirmationText(text);
		setFunctionToExecute(() => functionToExecute);
		chatDispatch({ type: 'ACTIVATE', payload: 'showConfirmation' });
	};
 
	const handleGameInvite = () => {
		globalState.gameTargetId = user.id;
		globalState.targetUsername = user.username;
		globalState.gameInvite = !globalState.gameInvite;
	}

	const removeFriends = async () => {

		try {
			const removeFriendDto = {
				friendID: user.id,
			}

			const response = await fetch(`${process.env.API_URL}/users/deleteFriendRequest`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				},
				body: JSON.stringify(removeFriendDto),
			})

			if (response.ok) {
				chatDispatch({ type: 'TOGGLEX', payload: 'refreshFriendsList' });
				chatDispatch({ type: 'DISABLE', payload: 'showConfirmation' });

				globalState.userSocket?.emit('refreshUser', { userToRefresh: user.username, target: 'refreshFriends', status: true});

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

	const handlFriendRequest = async (user: string) => {
		try {

			const friendRequestDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user,
			};

			const response = await fetch(`${process.env.API_URL}/users/addfriend`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(friendRequestDto),
			});

			if (response.ok) {
				
				const data = await response.json();
				if (!data) {
					return;
				}
				
				chatDispatch({ type: 'TOGGLEX', payload: 'refreshFriendsList' });
				chatDispatch({ type: 'DISABLE', payload: 'showAddChannel' });
				chatDispatch({ type: 'DISABLE', payload: 'showAddUser' });
				chatDispatch({ type: 'DISABLE', payload: 'showAddFriend' });

				if (globalState.userSocket?.connected) {
					globalState.userSocket?.emit('joinRoom', { roomName: data.name, roomID: data.id });
					globalState.userSocket?.emit('addFriend', friendRequestDto);
				}
			} else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		console.log("UseEffect gameSocketConnected :", gameSocketConnected)
	}, [gameSocketConnected, gameInviteValidation]);


	useEffect(() => {

		if (typeof globalState.gameSocket !== "undefined") {
			globalState.gameSocket.on('acceptInvitation', () => {
				console.log("VALIDATION");
				setgameInviteValidation(true);
				setgameSocketConnected(false);
			});
			globalState.userSocket?.on('deniedInvitation', () => {
				console.log("DENIED :", globalState.gameSocket?.id)
				setgameSocketConnected(false);
				globalState.gameSocket?.emit('gameInviteRejected')
				// enlever le userGameSockets
				globalState.gameSocket?.disconnect();

			});
			globalState.userSocket?.on('userToInviteAlreadyInGame', () => {
				setgameSocketConnected(false);
				// enlever le userGameSockets
				globalState.gameSocket?.emit('gameInviteRejected')
				globalState.gameSocket?.disconnect();

			});
			globalState.userSocket?.on('senderInGame', () => {
				setgameSocketConnected(false);
			})
			globalState.userSocket?.on('closedInvitation', () => {
				console.log("CLOSED :", globalState.gameSocket?.id)
				if (gameInviteValidation == false) {
					// enlever le userGameSockets
					console.log("CLOSED DENY :", globalState.gameSocket?.id)
					setgameSocketConnected(false);
					globalState.gameSocket?.emit('gameInviteRejected')
					globalState.gameSocket?.disconnect();
				}
				setgameSocketConnected(false);
			});
		}
		else {
			console.log("gameSocket undefined");
		}
		return () => {
			globalState.gameSocket?.off('acceptInvitation');
			globalState.userSocket?.off('closedInvitation');
			globalState.userSocket?.off('deniedInvitation');
			globalState.gameSocket?.off('disconnect');
		};
	}, [globalState?.gameSocket, gameInviteValidation, globalState?.userSocket, gameSocketConnected]);

	return (
		<>
			<div className="bloc-tab">

				{all &&
					<img className='image-tab' src="ajouter.png" onClick={() => handleTabClick(`Etes vous sur de vouloir ajouter à de votre liste d'amies ${user.username} ?`, () => handlFriendRequest(user.username))} />
				}
				<img className='image-tab' src="ping-pong.png" onClick={() => handleTabClick(`Etes vous sur de vouloir défier ${user.username} ?`, handleGameInvite)} />
				<img className='image-tab' src="ajouter-un-groupe.png" onClick={() => chatDispatch({ type: 'ACTIVATE', payload: 'showListChannelAdd' })} />
				<img className='image-tab' src="stats.png" />
				{user.isBlocked ? (
					<img className='image-tab' src="block.png" onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${user.username} ?`, unblockUser)} />
				)
					:
					<img className='image-tab-opacity' src="block.png" onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${user.username} ?`, blockUser)} />
				}
				{!all &&
					<img className='image-tab' src="closered.png" onClick={() => handleTabClick(`Etes vous sur de vouloir supprimer de votre liste d'amies ${user.username} ?`, removeFriends)} />
				}
			</div>
			{chatState.showConfirmation && (
				<ConfirmationComponent phrase={confirmationText} functionToExecute={funtionToExecute} />
			)}
			{chatState.showListChannelAdd && (
				<ListMyChannelComponent user={user.username} friendID={user.id} isAdd={false} title={`INVITE ${user.username} TO MY CHANNEL`} />
			)}
		</>
	);
}

export default FriendsListTabComponent;