import './Chat.css'
import React, {useState} from 'react'
import HeaderChatComponent from './headerChat/HeaderChat';
import { ChatProvider } from './ChatContext';
import { Socket } from 'socket.io-client'
import BodyChatComponent from './bodyChat/BodyChat';

const ChatComponent = (socket: {socket: Socket}) => {
	return (
		<ChatProvider>
			<div className="left-half">
					<HeaderChatComponent/>
					<BodyChatComponent socket={socket.socket}/>
			</div>
		</ChatProvider>
	)
};

	export default ChatComponent;