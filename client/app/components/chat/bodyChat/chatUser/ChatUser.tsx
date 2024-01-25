// BodyComponent.tsx
import './ChatUser.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../ChatContext';
import ReceiveBoxComponent from './receiveBox/ReceiveBox';
import SendBoxComponent from './sendBox/SendBox';
import ChatListComponent from './chatList/ChatList';
import { Socket } from 'socket.io-client'

const ChatUserComponent: React.FC = () => {

	const { chatState } = useChat();

	const renderComponent = (component: React.ReactNode, condition: boolean) => condition ? component : null;
	return (
		<div className="chat-user">
			{renderComponent(<ChatListComponent />, chatState.showChatList)}
			{renderComponent(<ReceiveBoxComponent />, chatState.showChat)}
			{renderComponent(<SendBoxComponent />, chatState.showChat)}
		</div>
  	);
};

export default ChatUserComponent;