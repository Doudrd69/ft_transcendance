// BodyComponent.tsx
import './ChatChannel.css';
import React from 'react';
import { useChat } from '../../ChatContext';
import ChannelListComponent from './channelList/ChannelList';
import ReceiveBoxChannelComponent from './receiveBoxChannel/ReceiveBoxChannel';
import SendBoxChannelComponent from './sendBoxChannel/SendBoxChannel';
import { Socket } from 'socket.io-client'

const ChatChannelComponent: React.FC = () => {

  const { state } = useChat();

  	const renderComponent = (component: React.ReactNode, condition: boolean) =>
    condition ? component : null;

  return (
    <div className="chat-channel">
		
		{renderComponent(<ChannelListComponent />, state.showChannelList)}
		{renderComponent(<ReceiveBoxChannelComponent />, state.showChannel)}
		{renderComponent(<SendBoxChannelComponent />, state.showChannel)}
    </div>
  );
};

export default ChatChannelComponent;