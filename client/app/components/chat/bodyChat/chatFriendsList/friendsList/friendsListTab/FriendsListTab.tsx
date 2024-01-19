import './FriendsListTab.css'
import React, { useState } from 'react';
import ConfirmationComponent from '../../confirmation/Confirmation';
import { useChat } from '@/app/components/chat/ChatContext';
import ListMyChannelComponent from '../../../listMyChannel/ListMyChannel';
import { Socket } from 'socket.io-client';
import { handleWebpackExternalForEdgeRuntime } from 'next/dist/build/webpack/plugins/middleware-plugin';
import { useGlobal } from '@/app/GlobalContext';

interface FriendsListTabComponentProps {
	userLogin : any;
	roomName : any;
	roomID : any;
}

const FriendsListTabComponent:  React.FC<FriendsListTabComponentProps> = ({ userLogin, roomName, roomID }) => {
	
	const {state, dispatch} = useChat();
	const [block, setBlock] = useState<boolean>(false);
	const {globalState} = useGlobal();
	const [confirmationText, setConfirmationText] = useState('');
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [funtionToExecute, setFunctionToExecute] = useState<() => void>(() => {});


	const blockUser = async() => {

		try {
			const BlockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user.login,
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
			user.isBlock = !user.isBlock;
			setBlock(true);

			globalState.userSocket?.emit('joinRoom', { roomName: `whoblocked${user.login}`, roomID: '' } );
		}
		}
		catch (error) {
			console.error(error);
		}
	}
	
	const unblockUser = async() => {

		try {

			const BlockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user.login,
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
			user.isBlock = !user.isBlock;
			setBlock(false);

			globalState.userSocket?.emit('leaveRoom', { roomName: `whoblocked${user.login}`, roomID: '' } );

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

			const blockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin:  userLogin,
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
				<button className='tab1' onClick={() => {
					dispatch({ type: 'TOGGLE', payload: 'showChat' });
					dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: userLogin});
					dispatch({ type: 'SET_CURRENT_ROOM', payload: roomName});
					dispatch({ type: 'SET_CURRENT_CONVERSATION_ID', payload: roomID});
					dispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });
				}}/>
				<button className='tab2' onClick={() => handleTabClick(`Etes vous sur de vouloir défier ${userLogin} ?`, gameInvite)} />
				<button className='tab3' onClick={() => dispatch({ type: 'ACTIVATE', payload: 'showListChannelAdd' })} />
				<button className='tab4'/>
				<img className='tab5' src="closered.png" onClick={() => handleTabClick(`Etes vous sur de vouloir supprimer de votre liste d'amies ${userLogin} ?`, removeFriends)}/>
				
				<img className='tab5' src="closered.png" onClick={() => handleTabClick(`Etes vous sur de vouloir supprimer de votre liste d'amies ${userLogin} ?`, removeFriends)}/>
			</div>
			{state.showConfirmation && (
			<ConfirmationComponent phrase={confirmationText} functionToExecute={funtionToExecute}/>
			)}
			{state.showListChannelAdd && (
				<ListMyChannelComponent user={userLogin}  title={`INVITE ${userLogin} TO MY CHANNEL`}/>
			)}
		</>
	);
}

export default FriendsListTabComponent;

