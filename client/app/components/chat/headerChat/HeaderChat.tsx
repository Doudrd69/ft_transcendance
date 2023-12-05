import './HeaderChat.css'
import React from 'react';
import FriendsListButtonComponent from './friendslistButton/FriendsListButton';
// import channelListButtonComponent from './channellistButton/channelListButton';

import AddComponent from './addButton/AddButton';
import BackComponent from './backButton/BackButton';
import IdDiscussionComponent from './id-discussion/Id-discussion';
import { useChat } from '../ChatContext';
import ChatUserComponent from '../bodyChat/chatUser/ChatUser';
import ChannelButtonComponent from './channelButton/ChannelButton';
import ChatButtonComponent from './chatButton/ChatButton';

const HeaderChatComponent: React.FC = () => {

	const { state, dispatch } = useChat();
	const renderComponent = (component: React.ReactNode, condition: boolean) =>
    	condition ? component : null;
	return (
		<div className="bloc-btn">
		{renderComponent(<BackComponent />, state.showChat)}
		{renderComponent(<IdDiscussionComponent />, state.showChat)}
		{renderComponent(<ChatButtonComponent />, !state.showChat)}
		{renderComponent(<ChannelButtonComponent />, !state.showChat)}
		{renderComponent(<FriendsListButtonComponent />, !state.showChat)}
		{renderComponent(<AddComponent />, !state.showChat)}
		</div>
	)
};
export default HeaderChatComponent;