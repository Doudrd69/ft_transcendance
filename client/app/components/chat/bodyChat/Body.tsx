// BodyComponent.tsx
import './Body.css';
import React from 'react';
import { useChat } from '../ChatContext';
import { Socket } from 'socket.io-client'
import AddComponent from './chatAdd/Add';
import ChatUserComponent from './chatUser/ChatUser';
import ChatChannelComponent from './chatChannel/ChatChannel';
import ChatFriendsListComponent from './chatFriendsList/ChatFriendsList';

const BodyComponent = (socket: {socket: Socket}) => {

	const { state, dispatch } = useChat();

	const renderComponent = (component: React.ReactNode, condition: boolean) =>
	  condition ? component : null;

	return (
		<div className="powerlifter">
			{renderComponent(<ChatUserComponent socket={socket.socket} />, state.showChat || state.showChatList)}
			{renderComponent(<ChatChannelComponent socket={socket.socket}/>, state.showChannel || state.showChannelList)}
			{renderComponent(<ChatFriendsListComponent/>, state.showFriendsList)}
			{renderComponent(<AddComponent socket={socket.socket}/>, state.showAdd)}
		</div>
	)
};

export default BodyComponent;
