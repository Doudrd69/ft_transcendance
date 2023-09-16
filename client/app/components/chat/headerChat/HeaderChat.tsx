import './HeaderChat.css'
import React from 'react';
import FriendsListComponent from './friendslist/FriendsList';
import DiscussionListComponent from './discussionlist/DiscussionList';
import AddComponent from './add/Add';

const HeaderChatComponent: React.FC = () => {

	return (
		<div className="bloc-btn">
			<DiscussionListComponent></DiscussionListComponent>
			<FriendsListComponent></FriendsListComponent>
			<AddComponent></AddComponent>
		</div>
	)
};
export default HeaderChatComponent;