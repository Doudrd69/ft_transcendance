// BodyComponent.tsx
import './ChatUser.css';
import React from 'react';
import { useChat } from '../../ChatContext';
import ReceiveBoxComponent from './receiveBox/ReceiveBox';
import SendBoxComponent from './sendBox/SendBox';
import ChatListComponent from './chatList/ChatList';

const ChatUserComponent: React.FC = () => {
  const { state, dispatch } = useChat();

  const renderComponent = (component: React.ReactNode, condition: boolean) =>
	condition ? component : null;
	console.log('État initial :', state); // Ajoutez cette ligne pour afficher l'état initial dans la console


  return (
	<div className="chat-user">
		{renderComponent(<ChatListComponent/>, state.showChatList)}
		{renderComponent(<ReceiveBoxComponent/>, state.showChat)}
		{renderComponent(<SendBoxComponent/>, state.showChat)}
	</div>
  );
};

export default ChatUserComponent;