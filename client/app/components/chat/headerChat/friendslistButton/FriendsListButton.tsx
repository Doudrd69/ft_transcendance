import './FriendsListButton.css'
import React, { useState } from 'react';
import { useChat } from '../../ChatContext';

const FriendsListButtonComponent: React.FC = () => {

	const {showFriendsList, handleFriendsList} = useChat();

	return (
		<button className={`main-button-friendslist ${showFriendsList ? 'clicked' : ''}`} onClick={handleFriendsList}>FriendsList</button>
	)
};
export default FriendsListButtonComponent;