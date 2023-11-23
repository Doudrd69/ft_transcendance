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
<<<<<<< HEAD
			{showChatList && <ChatListComponent/>}
			{showChannelList && <ChannelListComponent/>}
			{showAdd && <AddComponent socket={socket.socket}/>}
=======
			{showDiscussionList && <DiscussionListComponent/>}
			{showAdd && <AddComponent/>}
			{showChatDiscussion && <ChatDiscussionComponent socket={socket.socket}/>}
			{showChatDiscussion && <MessageComponent socket={socket.socket}/>}
>>>>>>> cf752e9 (Trying to retreive messages from conversation and display them)
		</div>
	)
};
export default BodyComponent;

/* pap donner le dossier  */