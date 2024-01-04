// BodyComponent.tsx
import './ChatFriendsList.css';
import React from 'react';
import { useChat } from '../../ChatContext';
import FriendsListComponent from './friendsList/FriendsList';
import { Socket } from 'socket.io-client'

interface ChatFriendsListComponentProps {
	userSocket: Socket;
}
const ChatFriendsListComponent:  React.FC<ChatFriendsListComponentProps> = ({ userSocket }) => {

  return (
	<div className="chat-friends-list">
		<FriendsListComponent userSocket={userSocket}/>
	</div>
  );
};

export default ChatFriendsListComponent;