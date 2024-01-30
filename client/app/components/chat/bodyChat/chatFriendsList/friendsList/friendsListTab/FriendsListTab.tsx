import './FriendsListTab.css'
import React, { use, useState, useEffect } from 'react';
import ConfirmationComponent from '../../confirmation/Confirmation';
import { useChat } from '@/app/components/chat/ChatContext';
import ListMyChannelComponent from '../../../listMyChannel/ListMyChannel';
import { io, Socket } from 'socket.io-client';
import { handleWebpackExternalForEdgeRuntime } from 'next/dist/build/webpack/plugins/middleware-plugin';
import { setGameSocket, useGlobal } from '@/app/GlobalContext';
import { ToastContainer, toast } from 'react-toastify';

interface User {
	id: number;
	username: string;
	isBlocked: boolean;
}

interface FriendsListTabComponentProps {
	user: User;
}

const FriendsListTabComponent: React.FC<FriendsListTabComponentProps> = ({ user }) => {

	// let gameInviteValidation: boolean = false;
	let gameSocketConnected: boolean = false;
	const [gameInviteValidation, setgameInviteValidation] = useState<boolean>(false);
	const { chatState, chatDispatch } = useChat();
	const { globalState, dispatch } = useGlobal();
	const [confirmationText, setConfirmationText] = useState('');
	const [showConfirmation, setShowConfirmation] = useState(false);
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

	const gameInvite = () => {
		// envoyer toast a lautre user et attendre la reponse
		// si l'autre accept envoyer emit de userOneId playerOneid userTwoId 
		console.log("Inviting user to play");

		if (gameSocketConnected === false) {
			const gameSocket = io(`${process.env.API_URL}/game`, {
				autoConnect: false,
				auth: {
			 		token: sessionStorage.getItem("jwt"),
				}
		  });
		  gameSocket.connect();
		  gameSocketConnected = true;
		  gameSocket.on('connect', () => {
			dispatch({ type: 'SET_GAME_SOCKET', payload: gameSocket });
			console.log("socketID :", gameSocket.id);
			globalState.userSocket?.emit('inviteToGame', {
			  usernameToInvite: user.username,
			  senderID: gameSocket.id,
			  senderUsername: sessionStorage.getItem("currentUserLogin"),
			  senderUserID: sessionStorage.getItem("currentUserID"),
			});
			setTimeout(() => {
			  gameSocketConnected = false;
			  if (gameInviteValidation === false) {
				console.log("validationoooooooo :", gameInviteValidation);
				globalState.gameSocket?.disconnect();
			  }
			}, 8000)
		  });
		}
	  };
	  
	  useEffect(() => {
		const subscription = globalState.gameSocket?.on('acceptInvitation', () => {
		  console.log("validation :", gameInviteValidation);
		  setgameInviteValidation(true);
		  // gameInviteValidation = true;
		});
	  
		return () => {
		  subscription?.off('acceptInviation');
		};
	  }, [globalState?.gameSocket, gameInviteValidation]);

	const removeFriends = async () => {

		try {
			const blockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user.username,
			}

			const response = await fetch(`${process.env.API_URL}/users/removeFriend`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				},
				body: JSON.stringify(blockUserDto),
			})

			if (response.ok) {
				const data = await response.json();
				if (data.accepted)
					setAccepted(data.accepted);
				chatDispatch({ type: 'TOGGLEX', payload: 'refreshFriendsList' });
				chatDispatch({ type: 'DISABLE', payload: 'showConfirmation' });


				globalState.userSocket?.emit('refreshUser', {
					userToRefresh: user.username,
					target: 'refreshFriends',
					status: true
				});
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
	return (
		<>
			<div className="bloc-tab">
				<img className='image-tab' src="ping-pong.png" onClick={() => handleTabClick(`Etes vous sur de vouloir défier ${user.username} ?`, gameInvite)} />
				<img className='image-tab' src="ajouter-un-groupe.png" onClick={() => chatDispatch({ type: 'ACTIVATE', payload: 'showListChannelAdd' })} />
				<img className='image-tab' src="stats.png" />
				{user.isBlocked ? (
					<img className='image-tab' src="block.png" onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${user.username} ?`, unblockUser)} />
				)
					:
					<img className='image-tab-opacity' src="block.png" onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${user.username} ?`, blockUser)} />
				}
				<img className='image-tab' src="closered.png" onClick={() => handleTabClick(`Etes vous sur de vouloir supprimer de votre liste d'amies ${user.username} ?`, removeFriends)} />
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