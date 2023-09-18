import './Body.css'
import React, {useState} from 'react';
import MessageComponent from './message/Message';
import DiscussionComponent from './discussion/Discussion';
import FriendsListComponent from './friendslist/FriendsList';

const BodyComponent: React.FC = () => {
    const [showLogin, setShowLogin] = useState(true);

	return (
        <div className="powerlifter">
            {/* <FriendsListComponent></FriendsListComponent> */}
            <DiscussionComponent></DiscussionComponent>
            <MessageComponent></MessageComponent>
        </div>
	)
};
export default BodyComponent;