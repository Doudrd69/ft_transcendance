import './ChannelList.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../../ChatContext';
import AddConversationComponent from '../../addConversation/AddConversation';
import { Socket } from 'socket.io-client';

interface ChannelListComponentProps {
	socket: Socket; // Assurez-vous d'avoir la bonne importation pour le type Socket
  }

  interface Conversation {
	id: number;
	name: string;
	is_channel: boolean;
  }
const ChannelListComponent: React.FC<ChannelListComponentProps> = ({ socket }) => {
const { state, dispatch } = useChat();
const [conversations, setConversations] = useState<Conversation[]>([]);
const user = sessionStorage.getItem("currentUserLogin");

const updateConversations = async () => {
	const response = await fetch(`http://localhost:3001/chat/getConversations/${user}`, {
	method: 'GET',
	});

	if (response.ok) {
	const userData = await response.json();
	setConversations(userData);
} else {
	console.log("Fatal error");
}
};
// Effet pour charger la liste des conversations lors du montage du composant
useEffect(() => {
	updateConversations();
}, []); // Le tableau vide en second argument signifie que cet effet ne sera exécuté qu'une fois lors du montage

const userData = {
	discussion: conversations,
	online: ["on", "off", "on", "on", "off", "on", "on"],
};

return (
	<div className="bloc-channel-list">
	<button
		className={`button-channel-list-add ${state.showAddChannel ? 'green-border' : ''}`}
		onClick={() => {
		dispatch({ type: 'ACTIVATE', payload: 'showAddChannel' });
		}}
	>
		+
	</button>
	{state.showAddChannel && <AddConversationComponent socket={socket} updateConversations={updateConversations} title="Add/Create Channel" isChannel={true}/>}
	{userData.discussion.map((conversation, index) => (
		conversation.is_channel && (
		<button
			key={index}
			className="button-channel-list"
			onClick={() => {
			dispatch({ type: 'TOGGLE', payload: 'showChannel' });
			dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
			}}
		>
			<span>{conversation.name}</span>
		</button>
		)
	))}
	</div>
);
};

export default ChannelListComponent;