// BodyComponent.tsx
import './ChatFriendsList.css';
import React from 'react';
import { useChat } from '../../ChatContext';
import FriendsListComponent from './friendsList/FriendsList';
import { Socket } from 'socket.io-client'

interface ChatFriendsListComponentProps {
	socket: Socket;
}
const ChatFriendsListComponent:  React.FC<ChatFriendsListComponentProps> = ({socket}) => {

  return (
	<div className="chat-friends-list">
		<FriendsListComponent socket={socket}/>
	</div>
  );
};

export default ChatFriendsListComponent;