import './Body.css'
import React, {useState} from 'react';
import MessageComponent from './message/Message';
import DiscussionListComponent from './discussionList/DiscussionList';
import { useChat } from '../ChatContext';
import ChatDiscussionComponent from './chatDiscussion/ChatDiscussion';
import AddComponent from './add/Add';
import FriendsListComponent from './friendsList/FriendsList';
import { Socket } from 'socket.io-client'

const BodyComponent = (socket: {socket: Socket}) => {
	const {showFriendsList, showDiscussionList, showAdd, showChatDiscussion} = useChat();

	return (
		<div className="powerlifter">
			{showFriendsList && <FriendsListComponent/>}
			{showDiscussionList && <DiscussionListComponent/>}
			{showAdd && <AddComponent/>}
			{showChatDiscussion && <ChatDiscussionComponent/>}
			{showChatDiscussion && <MessageComponent socket={socket.socket}/>}
		</div>
	)
};
export default BodyComponent;