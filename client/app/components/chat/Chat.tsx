import './Chat.css'
import React, {useState} from 'react'
import HeaderChatComponent from './headerChat/HeaderChat';
import { ChatProvider } from './ChatContext';
import { Socket } from 'socket.io-client'
import BodyChatComponent from './bodyChat/BodyChat';

interface ChatComponentProps {
	userSocket: Socket;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ userSocket }) => {
	return (
		<ChatProvider>
			<div className="left-half">
					<HeaderChatComponent/>
					<BodyChatComponent userSocket={userSocket}/>
			</div>
		</ChatProvider>
	)
};

	export default ChatComponent;