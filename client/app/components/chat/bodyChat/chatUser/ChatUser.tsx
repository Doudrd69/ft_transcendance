// BodyComponent.tsx
import './ChatUser.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../ChatContext';
import ReceiveBoxComponent from './receiveBox/ReceiveBox';
import SendBoxComponent from './sendBox/SendBox';
import ChatListComponent from './chatList/ChatList';
import { Socket } from 'socket.io-client'

interface ChatUserComponentProps {
	userSocket: Socket;
}

const ChatUserComponent: React.FC<ChatUserComponentProps> = ({ userSocket }) => {

	const { state, dispatch } = useChat();

	const renderComponent = (component: React.ReactNode, condition: boolean) => condition ? component : null;

	return (
		<div className="chat-user">
			{renderComponent(<ChatListComponent userSocket={userSocket}/>, state.showChatList)}
			{renderComponent(<ReceiveBoxComponent userSocket={userSocket} />, state.showChat)}
			{renderComponent(<SendBoxComponent userSocket={userSocket}/>, state.showChat)}
		</div>
  	);
};

export default ChatUserComponent;