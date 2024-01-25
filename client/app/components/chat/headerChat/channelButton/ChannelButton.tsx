import './ChannelButton.css';
import React from 'react';
import { useChat } from '../../ChatContext';

const ChannelButtonComponent: React.FC = () => {
  const { chatState, chatDispatch } = useChat();

  return (
	<button
	  className={`main-button-channel ${chatState.showChannelList ? 'clicked' : ''}`}
	  onClick={() => {
	  chatDispatch({ type: 'TOGGLE', payload: 'showChannelList' })
	  chatDispatch({type: 'ACTIVATE', payload: 'showBackComponent'})}}>
	  Channel
	</button>
  );
};

export default ChannelButtonComponent;
