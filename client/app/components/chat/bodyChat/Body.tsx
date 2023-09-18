import './Body.css'
import React from 'react';
import MessageComponent from './message/Message';
import DiscussionComponent from './discussion/Discussion';
import FriendsListComponent from './friendslist/FriendsList';

const BodyComponent: React.FC = () => {

	return (
        <>
            {/* <FriendsListComponent></FriendsListComponent> */}
            <DiscussionComponent></DiscussionComponent>
            <MessageComponent></MessageComponent>
        </>
	)
};
export default BodyComponent;