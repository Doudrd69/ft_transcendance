// BodyComponent.tsx
import './BodyChat.css';
import React from 'react';
import { useChat } from '../ChatContext';
import { Socket } from 'socket.io-client'
import ChatUserComponent from './chatUser/ChatUser';
import ChatChannelComponent from './chatChannel/ChatChannel';
import ChatFriendsListComponent from './chatFriendsList/ChatFriendsList';

const BodyChatComponent: React.FC = () => {

	const { state } = useChat();

	const renderComponent = (component: React.ReactNode, condition: boolean) =>
	  condition ? component : null;

	return (
		<div className="powerlifter">
			{renderComponent(<ChatUserComponent />, state.showChat || state.showChatList)}
			{renderComponent(<ChatChannelComponent />, state.showChannel || state.showChannelList)}
			{renderComponent(<ChatFriendsListComponent />, state.showFriendsList)}
		</div>
	)
};

export default BodyChatComponent;
