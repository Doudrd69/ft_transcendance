// BodyComponent.tsx
import './Body.css';
import React from 'react';
import { useChat } from '../ChatContext';
import { Socket } from 'socket.io-client'
import FriendsListComponent from './chatFriendsList/ChatFriendsList'
import ChatListComponent from './chatUser/chatList/ChatList';
import AddComponent from './chatAdd/Add';
import ChannelListComponent from './chatChannel/channelList/ChannelList';

const BodyComponent = (socket: {socket: Socket}) => {

	const { state } = useChat();
	const {showFriendsList, showChatList, showAdd, showChannelList} = state;
	return (
		<div className="powerlifter">
			{showFriendsList && <FriendsListComponent/>}
			{showChatList && <ChatListComponent/>}
			{showChannelList && <ChannelListComponent/>}
			{showAdd && <AddComponent socket={socket.socket}/>}
		</div>
	)
};
export default BodyComponent;

/* pap donner le dossier  */
