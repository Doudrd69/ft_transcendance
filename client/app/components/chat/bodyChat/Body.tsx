import './Body.css'
import React, {useState} from 'react';
import MessageComponent from './message/Message';
import DiscussionComponent from './discussionList/DiscussionList';
import FriendsListComponent from './friendsList/FriendsList';
import { useChat } from '../ChatContext';
import ChatDiscussionComponent from './chatDiscussion/ChatDiscussionList';
import AddComponent from './add/Add';

const BodyComponent: React.FC = () => {
	const { showFriendsList, showDiscussionList, showAdd, showChatDiscussion} = useChat();

	return (
		<div className="powerlifter">
			{showFriendsList && <FriendsListComponent />}
			{showDiscussionList && <DiscussionComponent/>}
			{showAdd && <AddComponent></AddComponent>}
			{/* {showChatDiscussion && <ChatDiscussionComponent/>}
			{showChatDiscussion && <ChatDiscussionComponent/>} */}
		</div>
	)
};
export default BodyComponent;