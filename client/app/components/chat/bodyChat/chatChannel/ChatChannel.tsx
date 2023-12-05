// BodyComponent.tsx
import './ChatChannel.css';
import React from 'react';
import { useChat } from '../../ChatContext';

const ChatChannelComponent: React.FC = () => {
  const { state, dispatch } = useChat();

  const renderComponent = (component: React.ReactNode, condition: boolean) =>
    condition ? component : null;

  return (
    <div className="chat-channel">

    </div>
  );
};

export default ChatChannelComponent;