import './FriendsListTab.css'
import React, { useState } from 'react';
import ConfirmationComponent from '../../confirmation/Confirmation';
import { useChat } from '@/app/components/chat/ChatContext';
import ListMyChannelComponent from '../../../listMyChannel/ListMyChannel';
import { Socket } from 'socket.io-client';

interface FriendsListTabComponentProps {
	socket: Socket; 
	user : string;
  }

const FriendsListTabComponent:  React.FC<FriendsListTabComponentProps> = ({ socket, user }) => {
	const {state, dispatch} = useChat();

	const [confirmationText, setConfirmationText] = useState('');
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleTabClick = (text: string) => {
		setConfirmationText(text);
		dispatch({ type: 'ACTIVATE', payload: 'showConfirmation' });
	};

	return (
		<>
			<div className="bloc-tab">
				<button className='tab1'/>
				<button className='tab2' onClick={() => handleTabClick(`Etes vous sur de vouloir défier ${user} ?`)} />
				<button className='tab3' onClick={() => dispatch({ type: 'ACTIVATE', payload: 'showListChannelAdd' })} />
				<button className='tab4'/>
				<button className='tab5' onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${user} ?`)}/>
				
			</div>
			{state.showConfirmation && (
			<ConfirmationComponent phrase={confirmationText}/>
			)}
			{state.showListChannelAdd && (
				<ListMyChannelComponent socket={socket}/>
			)}
		</>
	);
}

export default FriendsListTabComponent;

