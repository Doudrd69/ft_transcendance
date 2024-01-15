import './FriendsListTab.css'
import React, { useState } from 'react';
import ConfirmationComponent from '../../confirmation/Confirmation';
import { useChat } from '@/app/components/chat/ChatContext';
import ListMyChannelComponent from '../../../listMyChannel/ListMyChannel';
import { Socket } from 'socket.io-client';
import { handleWebpackExternalForEdgeRuntime } from 'next/dist/build/webpack/plugins/middleware-plugin';




interface FriendsListTabComponentProps {
	userSocket: Socket; 
	userLogin : any;
	roomName : any;
	roomID : any;
}

const FriendsListTabComponent:  React.FC<FriendsListTabComponentProps> = ({ userSocket, userLogin, roomName, roomID }) => {
	
	const {state, dispatch} = useChat();
	const [confirmationText, setConfirmationText] = useState('');
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [funtionToExecute, setFunctionToExecute] = useState<() => void>(() => {});
	console.log("userLogin --> ", userLogin);
	console.log("roomName --> ", roomName);
	console.log("roomID --> ", roomID);
	const handleTabClick = (text: string, functionToExecute: any) => {
		setConfirmationText(text);
		setFunctionToExecute(() => functionToExecute);
		dispatch({ type: 'ACTIVATE', payload: 'showConfirmation' });
	};

	const gameInvite = () => {
		console.log("Inviting user to play");
	}

	const blockUser = async () => {

		const blockUserDto = {
			initiatorLogin: sessionStorage.getItem("currentUserLogin"),
			recipientLogin:  userLogin,
		}

		const response = await fetch('http://localhost:3001/users/blockUser', {
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
		else {
			console.log("Fatal error: failed request");
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
				<button className='tab5' onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${userLogin} ?`, blockUser)}/>
				
			</div>
			{state.showConfirmation && (
			<ConfirmationComponent phrase={confirmationText} functionToExecute={funtionToExecute}/>
			)}
			{state.showListChannelAdd && (
				<ListMyChannelComponent userSocket={userSocket} user={userLogin}  title={`INVITE ${userLogin} TO MY CHANNEL`}/>
			)}
		</>
	);
}

export default FriendsListTabComponent;

