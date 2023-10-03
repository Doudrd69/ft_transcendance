import './HeaderChat.css'
import React from 'react';
import FriendsListButtonComponent from './friendslistButton/FriendsListButton';
import DiscussionListButtonComponent from './discussionlistButton/DiscussionListButton';
import AddComponent from './addButton/AddButton';
import BackComponent from './backButton/BackButton';
import IdDiscussionComponent from './id-discussion/Id-discussion';
import { useChat } from '../ChatContext';

const HeaderChatComponent: React.FC = () => {

	const {showChatDiscussion} = useChat();
	return (
		<div className="bloc-btn">
			{ showChatDiscussion && <BackComponent/>}
			{showChatDiscussion && <IdDiscussionComponent/>}
			{!showChatDiscussion && <DiscussionListButtonComponent/>}
			{!showChatDiscussion && <FriendsListButtonComponent/>}
			{!showChatDiscussion && <AddComponent/>}
		</div>
	)
};
export default HeaderChatComponent;