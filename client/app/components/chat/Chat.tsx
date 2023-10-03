import './Chat.css'
import React, {useState} from 'react'
import HeaderChatComponent from './headerChat/HeaderChat';
import BodyComponent from './bodyChat/Body';
import { ChatProvider } from './ChatContext';

const ChatComponent: React.FC = () => {
	return (
		<ChatProvider>
			<div className="left-half">
					<HeaderChatComponent/>
					<BodyComponent/>
			</div>
		</ChatProvider>
	)
};

	export default ChatComponent;