// BodyComponent.tsx
import './BodyChat.css';
import { useChat } from '../ChatContext';
import { Socket } from 'socket.io-client'
import ChatUserComponent from './chatUser/ChatUser';
import ChatChannelComponent from './chatChannel/ChatChannel';
import ChatFriendsListComponent from './chatFriendsList/ChatFriendsList';
import React, { use, useState, useEffect } from 'react';
import StatistiquesComponent from '../../stats/Statistiques';

const BodyChatComponent: React.FC = () => {

	const { chatState } = useChat();

	const renderComponent = (component: React.ReactNode, condition: boolean) =>
	  condition ? component : null;

	return (
		<div className="powerlifter">
			{renderComponent(<ChatUserComponent />, chatState.showChat || chatState.showChatList)}
			{renderComponent(<ChatChannelComponent />, chatState.showChannel || chatState.showChannelList)}
			{renderComponent(<ChatFriendsListComponent />, chatState.showFriendsList)}
			{renderComponent( <StatistiquesComponent/>, chatState.showStatistiques)}
		</div>
	)
};

export default BodyChatComponent;
