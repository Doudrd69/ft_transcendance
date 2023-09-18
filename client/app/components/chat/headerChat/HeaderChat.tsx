import './HeaderChat.css'
import React from 'react';
import FriendsListButtonComponent from './friendslistButton/FriendsListButton';
import DiscussionListButtonComponent from './discussionlistButton/DiscussionListButton';
import AddComponent from './add/Add';
import BackComponent from './back/Back';
import IdDiscussionComponent from './id-discussion/Id-discussion';

const HeaderChatComponent: React.FC = () => {

	return (
		<div className="bloc-btn">
			{/* <BackComponent></BackComponent>
			<IdDiscussionComponent></IdDiscussionComponent> */}
			<DiscussionListButtonComponent></DiscussionListButtonComponent>
			<FriendsListButtonComponent></FriendsListButtonComponent>
			<AddComponent></AddComponent>
		</div>
	)
};
export default HeaderChatComponent;