// BodyComponent.tsx
import './ChatChannel.css';
import React from 'react';
import { useChat } from '../../ChatContext';
import ChannelListComponent from './channelList/ChannelList';
import ReceiveBoxChannelComponent from './receiveBoxChannel/ReceiveBoxChannel';
import SendBoxChannelComponent from './sendBoxChannel/SendBoxChannel';
import { Socket } from 'socket.io-client'

const ChatChannelComponent: React.FC = () => {

  const { chatState } = useChat();

  const renderComponent = (component: React.ReactNode, condition: boolean) =>
    condition ? component : null;

  return (
    <div className="chat-channel">

      {renderComponent(<ChannelListComponent />, chatState.showChannelList)}
      {renderComponent(<ReceiveBoxChannelComponent />, chatState.showChannel)}
      {renderComponent(<SendBoxChannelComponent />, chatState.showChannel)}
    </div>
  );
};

export default ChatChannelComponent;