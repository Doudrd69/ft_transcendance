import './FriendsListTab.css'
import React, { useState } from 'react';
import ConfirmationComponent from '../../confirmation/Confirmation';
import { useChat } from '@/app/components/chat/ChatContext';
import ListMyChannelComponent from '../../../listMyChannel/ListMyChannel';
import { Socket } from 'socket.io-client';

interface FriendsListTabComponentProps {
	userSocket: Socket; 
	user : string;
}

const FriendsListTabComponent:  React.FC<FriendsListTabComponentProps> = ({ userSocket, user }) => {
	
	const {state, dispatch} = useChat();
	const [confirmationText, setConfirmationText] = useState('');
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [funtionToExecute, setFunctionToExecute] = useState<() => void>(() => {});
	
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
			recipientLogin: user,
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
				console.log(`${user} has been blocked`);
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
				<button className='tab1'/>
				<button className='tab2' onClick={() => handleTabClick(`Etes vous sur de vouloir défier ${user} ?`, gameInvite)} />
				<button className='tab3' onClick={() => dispatch({ type: 'ACTIVATE', payload: 'showListChannelAdd' })} />
				<button className='tab4'/>
				<button className='tab5' onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${user} ?`, blockUser)}/>
				
			</div>
			{state.showConfirmation && (
			<ConfirmationComponent phrase={confirmationText} functionToExecute={funtionToExecute}/>
			)}
			{state.showListChannelAdd && (
				<ListMyChannelComponent userSocket={userSocket} user={user}/>
			)}
		</>
	);
}

export default FriendsListTabComponent;

