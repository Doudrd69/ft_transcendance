import './ChannelButton.css';
import React from 'react';
import { useChat } from '../../ChatContext';

const ChannelButtonComponent: React.FC = () => {
  const { state, dispatch } = useChat();

  return (
	<button
	  className={`main-button-channel ${state.showChannelList ? 'clicked' : ''}`}
	  onClick={() => 
	  dispatch({ type: 'TOGGLE', payload: 'showChannelList' })}>
	  Channel
	</button>
  );
};

export default ChannelButtonComponent;
