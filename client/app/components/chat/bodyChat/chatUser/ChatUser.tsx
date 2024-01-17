// BodyComponent.tsx
import './ChatUser.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../ChatContext';
import ReceiveBoxComponent from './receiveBox/ReceiveBox';
import SendBoxComponent from './sendBox/SendBox';
import ChatListComponent from './chatList/ChatList';
import { Socket } from 'socket.io-client'

const ChatUserComponent: React.FC = () => {

	const { state } = useChat();

	const renderComponent = (component: React.ReactNode, condition: boolean) => condition ? component : null;
	return (
		<div className="chat-user">
			{renderComponent(<ChatListComponent />, state.showChatList)}
			{renderComponent(<ReceiveBoxComponent />, state.showChat)}
			{renderComponent(<SendBoxComponent />, state.showChat)}
		</div>
  	);
};

export default ChatUserComponent;