import './FriendsListTab.css'
import React, { use, useState } from 'react';
import ConfirmationComponent from '../../confirmation/Confirmation';
import { useChat } from '@/app/components/chat/ChatContext';
import ListMyChannelComponent from '../../../listMyChannel/ListMyChannel';
import { Socket } from 'socket.io-client';
import { handleWebpackExternalForEdgeRuntime } from 'next/dist/build/webpack/plugins/middleware-plugin';
import { useGlobal } from '@/app/GlobalContext';

interface User {
	id: number;
	username: string;
	isBlocked: boolean;
}

interface FriendsListTabComponentProps {
	user: User;
}


const FriendsListTabComponent:  React.FC<FriendsListTabComponentProps> = ({user}) => {
	
	const {state, dispatch} = useChat();
	const {globalState} = useGlobal();
	const [confirmationText, setConfirmationText] = useState('');
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [funtionToExecute, setFunctionToExecute] = useState<() => void>(() => {});
	console.log("user", user);

	const blockUser = async() => {

		try {
			console.log("bebebebebeebeb")

			const BlockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user.username,
			}
	
			const response = await fetch(`http://localhost:3001/users/blockUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(BlockUserDto),
			});
		
		if (response.ok) {
			user.isBlocked = true;
			dispatch({ type: 'DISABLE', payload: 'showConfirmation' })
			globalState.userSocket?.emit('joinRoom', { roomName: `whoblocked${user.username}`, roomID: '' } );
		}
		}
		catch (error) {
			console.error(error);
		}
	}
	
	const unblockUser = async() => {

		try {
			console.log("ahahahahah")
			const BlockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user.username,
			}
				const response = await fetch(`http://localhost:3001/users/unblockUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(BlockUserDto),
			});
		
		if (response.ok) {
			user.isBlocked = false;

			globalState.userSocket?.emit('leaveRoom', { roomName: `whoblocked${user.username}`, roomID: '' } );
			dispatch({ type: 'DISABLE', payload: 'showConfirmation' })
			console.log("unblock");
		}
		}
		catch (error) {
			console.error(error);
		}
	}

	const handleTabClick = (text: string, functionToExecute: any) => {
		setConfirmationText(text);
		setFunctionToExecute(() => functionToExecute);
		dispatch({ type: 'ACTIVATE', payload: 'showConfirmation' });
	};

	const gameInvite = () => {
		console.log("Inviting user to play");
	}

	const removeFriends = async () => {

		try {
			console.log("Removing friend");
			const blockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin:  user.username,
			}
	
			const response = await fetch('http://localhost:3001/users/removeFriend', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				},
				body: JSON.stringify(blockUserDto),
			})
	
			if (response.ok) {
	
				dispatch({ type: 'DISABLE', payload: 'showConfirmation' })
				const data = await response.json();
				if (!data.isAccepted) {
					return ;
				}
				else {
					console.log("Fatal error");
				}
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
				<img className='image-tab' src="ajouter-un-groupe.png" onClick={() => dispatch({ type: 'ACTIVATE', payload: 'showListChannelAdd' })} />
				<img className='image-tab' src="stats.png"/>
				{user.isBlocked ? (
					<img className='image-tab' src="block.png" onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${user.username} ?`, unblockUser)}/>
				)
				:
					<img className='image-tab-opacity' src="block.png" onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${user.username} ?`, blockUser)}/>
				}
				<img className='image-tab' src="closered.png" onClick={() => handleTabClick(`Etes vous sur de vouloir supprimer de votre liste d'amies ${user.username} ?`, removeFriends)}/>
			</div>
			{state.showConfirmation && (
			<ConfirmationComponent phrase={confirmationText} functionToExecute={funtionToExecute}/>
			)}
			{state.showListChannelAdd && (
				<ListMyChannelComponent user={user.username}  title={`INVITE ${user.username} TO MY CHANNEL`}/>
			)}
		</>
	);
}

export default FriendsListTabComponent;