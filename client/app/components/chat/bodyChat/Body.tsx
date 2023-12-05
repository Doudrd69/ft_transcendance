// BodyComponent.tsx
import './Body.css';
import React from 'react';
import { useChat } from '../ChatContext';

import ChatUserComponent from './chatUser/ChatUser';
import ChatChannelComponent from './chatChannel/ChatChannel';
import ChatFriendsListComponent from './chatFriendsList/ChatFriendsList';
import AddComponent from './chatAdd/Add';



const BodyComponent: React.FC = () => {
  const { state, dispatch } = useChat();

  const renderComponent = (component: React.ReactNode, condition: boolean) =>
    condition ? component : null;
	console.log('État initial :', state); // Ajoutez cette ligne pour afficher l'état initial dans la console

  return (
    <div className="powerlifter">
      {renderComponent(<ChatUserComponent/>, state.showChatList || state.showChat)}
      {renderComponent(<ChatFriendsListComponent/>, state.showFriendsList)}
      {renderComponent(<ChatChannelComponent />, state.showChannelList)}
      {renderComponent(<AddComponent />, state.showAdd)}
    </div>
  );
};

export default BodyComponent;
