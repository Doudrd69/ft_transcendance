// BodyComponent.tsx
import './ChatChannel.css';
import React from 'react';
import { useChat } from '../../ChatContext';
import ChannelListComponent from './channelList/ChannelList';
import ReceiveBoxChannelComponent from './receiveBoxChannel/ReceiveBoxChannel';
import SendBoxChannelComponent from './sendBoxChannel/SendBoxChannel';
import { Socket } from 'socket.io-client'

const ChatChannelComponent = (socket: {socket: Socket} ) => {
  const { state, dispatch } = useChat();

  const renderComponent = (component: React.ReactNode, condition: boolean) =>
    condition ? component : null;

  return (
    <div className="chat-channel">
		{renderComponent(<ChannelListComponent/>, state.showChannelList)}
		{renderComponent(<ReceiveBoxChannelComponent socket={socket.socket} />, state.showChannel)}
		{renderComponent(<SendBoxChannelComponent socket={socket.socket}/>, state.showChannel)}
    </div>
  );
};

export default ChatChannelComponent;