import './chat.css'
import React from 'react'
import HeaderChatComponent from './headerChat/HeaderChat';
import BodyComponent from './bodyChat/Body';

const ChatComponent: React.FC = () => {

	return (
		<div className="left-half">
			<HeaderChatComponent></HeaderChatComponent>
			<BodyComponent></BodyComponent>
		</div>
	)
};

	export default ChatComponent;