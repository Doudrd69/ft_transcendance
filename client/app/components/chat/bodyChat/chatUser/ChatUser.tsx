// BodyComponent.tsx
import './ChatUser.css';
import React from 'react';
import { useChat } from '../../ChatContext';
import ReceiveBoxComponent from './receiveBox/ReceiveBox';
import SendBoxComponent from './sendBox/SendBox';
import ChatListComponent from './chatList/ChatList';
import { Socket } from 'socket.io-client'

const ChatUserComponent = (socket: {socket: Socket} ) => {
  const { state, dispatch } = useChat();

  const renderComponent = (component: React.ReactNode, condition: boolean) =>
	condition ? component : null;

  return (
	<div className="chat-user">
		{renderComponent(<ChatListComponent/>, state.showChatList)}
		{renderComponent(<ReceiveBoxComponent socket={socket.socket} />, state.showChat)}
		{renderComponent(<SendBoxComponent socket={socket.socket}/>, state.showChat)}
	</div>
  );
};

export default ChatUserComponent;