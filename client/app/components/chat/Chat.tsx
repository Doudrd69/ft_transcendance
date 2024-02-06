import './Chat.css'
import React, {useState} from 'react'
import HeaderChatComponent from './headerChat/HeaderChat';
import { ChatProvider } from './ChatContext';
import { Socket } from 'socket.io-client'
import BodyChatComponent from './bodyChat/BodyChat';

const ChatComponent: React.FC = () => {
	return (
			<div className="left-half">
				<div className="header-body">
					<HeaderChatComponent/>
					<BodyChatComponent />
				</div>
			</div>
	)
};

	export default ChatComponent;