import './HeaderChat.css'
import React from 'react';
import FriendsListButtonComponent from './friendslistButton/FriendsListButton';
import AddComponent from './addButton/AddButton';
import BackComponent from './backButton/BackButton';
import IdDiscussionComponent from './id-discussion/Id-discussion';
import { useChat } from '../ChatContext';
import ChatUserComponent from '../bodyChat/chatUser/ChatUser';
import ChannelButtonComponent from './channelButton/ChannelButton';
import ChatButtonComponent from './chatButton/ChatButton';
import { Socket } from 'socket.io-client';

interface HeaderChatProps {
	userSocket: Socket;
}

const HeaderChatComponent: React.FC<HeaderChatProps>= ({userSocket}) => {

	const { state, dispatch } = useChat();
	const renderComponent = (component: React.ReactNode, condition: boolean) =>
    	condition ? component : null;
		console.log("staaaaate", state);
	return (
		<div className="bloc-btn">
			{renderComponent(<IdDiscussionComponent userSocket={userSocket} />, state.showChat || state.showChannel)}
			{renderComponent(<BackComponent />, (state.showChat || state.showChannel) && state.showBackComponent)}
			{renderComponent(<ChatButtonComponent />, !state.showChat && !state.showChannel)}
			{renderComponent(<ChannelButtonComponent />, !state.showChat && !state.showChannel)}
			{renderComponent(<FriendsListButtonComponent />, !state.showChat && !state.showChannel)}
		</div>
	)
};
export default HeaderChatComponent;