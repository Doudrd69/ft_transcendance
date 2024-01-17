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

	const { state, dispatch } = useChat();
	const renderComponent = (component: React.ReactNode, condition: boolean) =>
    	condition ? component : null;

	return (
		<div className="bloc-btn">
			{renderComponent(<IdDiscussionComponent />, state.showChat || state.showChannel)}
			{renderComponent(<BackComponent />, (state.showChat || state.showChannel) && state.showBackComponent)}
			{renderComponent(<ChatButtonComponent />, !state.showChat && !state.showChannel)}
			{renderComponent(<ChannelButtonComponent />, !state.showChat && !state.showChannel)}
			{renderComponent(<FriendsListButtonComponent />, !state.showChat && !state.showChannel)}
		</div>
	)
};
export default HeaderChatComponent;
