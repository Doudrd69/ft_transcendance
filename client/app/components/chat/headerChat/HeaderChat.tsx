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

const HeaderChatComponent: React.FC = () => {

	const { chatState, chatDispatch } = useChat();
	const renderComponent = (component: React.ReactNode, condition: boolean) =>
    	condition ? component : null;

	return (
		<div className="bloc-btn">
			{renderComponent(<IdDiscussionComponent />, chatState.showChat || chatState.showChannel)}
			{renderComponent(<BackComponent />, (chatState.showChat || chatState.showChannel) && chatState.showBackComponent)}
			{renderComponent(<ChatButtonComponent />, !chatState.showChat && !chatState.showChannel)}
			{renderComponent(<ChannelButtonComponent />, !chatState.showChat && !chatState.showChannel)}
			{renderComponent(<FriendsListButtonComponent />, !chatState.showChat && !chatState.showChannel)}
		</div>
	)
};
export default HeaderChatComponent;
