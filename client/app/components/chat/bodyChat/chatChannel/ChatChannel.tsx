// BodyComponent.tsx
import './ChatChannel.css';
import React from 'react';
import { useChat } from '../../ChatContext';
import ChannelListComponent from './channelList/ChannelList';
import ReceiveBoxChannelComponent from './receiveBoxChannel/ReceiveBoxChannel';
import SendBoxChannelComponent from './sendBoxChannel/SendBoxChannel';
import { Socket } from 'socket.io-client'

interface BodyChatComponentProps {
	userSocket: Socket;
}

const ChatChannelComponent: React.FC<BodyChatComponentProps> = ({ userSocket }) => {
  const { state, dispatch } = useChat();

  	const renderComponent = (component: React.ReactNode, condition: boolean) =>
    condition ? component : null;


  return (
    <div className="chat-channel">

		{renderComponent(<ChannelListComponent userSocket={userSocket} />, state.showChannelList)}
		{renderComponent(<ReceiveBoxChannelComponent userSocket={userSocket} />, state.showChannel)}
		{renderComponent(<SendBoxChannelComponent userSocket={userSocket}/>, state.showChannel)}
    </div>
  );
};

export default ChatChannelComponent;