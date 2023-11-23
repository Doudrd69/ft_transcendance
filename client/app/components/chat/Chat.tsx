import './Chat.css'
import React, {useState} from 'react'
import HeaderChatComponent from './headerChat/HeaderChat';
import BodyComponent from './bodyChat/Body';
import { ChatProvider } from './ChatContext';
import { Socket } from 'socket.io-client'

const ChatComponent = (socket: {socket: Socket}) => {
	return (
		<ChatProvider>
			<div className="left-half">
					<HeaderChatComponent/>
					<BodyComponent socket={socket.socket}/>
			</div>
		</ChatProvider>
	)
};

	export default ChatComponent;