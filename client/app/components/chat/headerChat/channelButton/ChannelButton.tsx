import './ChannelButton.css';
import React from 'react';
import { useChat } from '../../ChatContext';

const ChannelButtonComponent: React.FC = () => {
  const { chatState, chatDispatch } = useChat();

  return (
	<button
	  className={`main-button-channel ${state.showChannelList ? 'clicked' : ''}`}
	  onClick={() => {
	  dispatch({ type: 'TOGGLE', payload: 'showChannelList' })
	  dispatch({type: 'ACTIVATE', payload: 'showBackComponent'})}}>
	  Channel
	</button>
  );
};

export default ChannelButtonComponent;
