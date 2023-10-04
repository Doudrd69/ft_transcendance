import './Body.css'
import React, {useState} from 'react';
import MessageComponent from './message/Message';
import DiscussionListComponent from './discussionList/DiscussionList';
import { useChat } from '../ChatContext';
import ChatDiscussionComponent from './chatDiscussion/ChatDiscussion';
import AddComponent from './add/Add';
import FriendsListComponent from './friendslist/FriendsList';

const BodyComponent: React.FC = () => {
	const {showFriendsList, showDiscussionList, showAdd, showChatDiscussion} = useChat();

	return (
		<div className="powerlifter">
			{showFriendsList && <FriendsListComponent/>}
			{showDiscussionList && <DiscussionListComponent/>}
			{showAdd && <AddComponent/>}
			{showChatDiscussion && <ChatDiscussionComponent/>}
			{showChatDiscussion && <MessageComponent/>}
		</div>
	)
};
export default BodyComponent;