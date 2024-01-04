// BodyComponent.tsx
import './BodyChat.css';
import React from 'react';
import { useChat } from '../ChatContext';
import { Socket } from 'socket.io-client'
import AddComponent from './chatAdd/Add';
import ChatUserComponent from './chatUser/ChatUser';
import ChatChannelComponent from './chatChannel/ChatChannel';
import ChatFriendsListComponent from './chatFriendsList/ChatFriendsList';

interface BodyChatComponentProps {
	userSocket: Socket;
}

const BodyChatComponent: React.FC<BodyChatComponentProps> = ({ userSocket }) => {

	const { state, dispatch } = useChat();

	const renderComponent = (component: React.ReactNode, condition: boolean) =>
	  condition ? component : null;

	return (
		<div className="powerlifter">
			{renderComponent(<ChatUserComponent userSocket={userSocket} />, state.showChat || state.showChatList)}
			{renderComponent(<ChatChannelComponent userSocket={userSocket}/>, state.showChannel || state.showChannelList)}
			{renderComponent(<ChatFriendsListComponent userSocket={userSocket}/>, state.showFriendsList)}
			{renderComponent(<AddComponent userSocket={userSocket}/>, state.showAdd)}
		</div>
	)
};

export default BodyChatComponent;
