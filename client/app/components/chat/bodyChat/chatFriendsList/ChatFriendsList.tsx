// BodyComponent.tsx
import './ChatFriendsList.css';
import React from 'react';
import { useChat } from '../../ChatContext';
import FriendsListComponent from './friendsList/FriendsList';
import { Socket } from 'socket.io-client'

const ChatFriendsListComponent:  React.FC = () => {

  return (
	<div className="chat-friends-list">
		<FriendsListComponent />
	</div>
  );
};

export default ChatFriendsListComponent;