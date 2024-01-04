import './ListMyChannel.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../ChatContext';
import { Socket } from 'socket.io-client';

interface ListMyChannelComponentProps {
	userSocket: Socket; // Assurez-vous d'avoir la bonne importation pour le type Socket
}

interface Conversation {
	id: number;
	name: string;
	is_channel: boolean;
}

const ListMyChannelComponent: React.FC<ListMyChannelComponentProps> = ({ userSocket }) => {
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

const handleCloseList = () => {
    dispatch({ type: 'DISABLE', payload: 'showListChannelAdd' });
  };

return (
	<div className='blur-background'>
		<div className='juste-pour-englober'>
			<button className="close-button" onClick={handleCloseList}>
			&#10006;
			</button>
			<p className="title-list-channel-component">CHOOSE IN YOUR SERVER</p>
				<div className="bloc-add-channel-list">
					{userData.discussion.map((conversation, index) => (
						conversation.is_channel && (
						<button
							key={index}
							className="button-add-channel-list"
							onClick={() => {
							// dispatch({ type: 'TOGGLE', payload: 'showChannel' });
							// dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
							}}
						>
							<span>{conversation.name}</span>
						</button>
						)
					))}
				</div>
		</div>
	</div>
);
};

export default ListMyChannelComponent;