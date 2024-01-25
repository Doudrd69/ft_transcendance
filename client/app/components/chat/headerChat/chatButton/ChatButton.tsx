// import Image from './chat.png';  // Le chemin commence à partir de la racine du dossier 'public'
import './ChatButton.css';
import React from 'react';
import { useChat } from '../../ChatContext';

const ChatButtonComponent: React.FC = () => {
  const { chatState, chatDispatch } = useChat();

  return (
    <button
      className={`main-button-chat ${chatState.showChatList ? 'clicked' : ''}`}
      onClick={() => {
		chatDispatch({ type: 'TOGGLE', payload: 'showChatList' })
		chatDispatch({type: 'ACTIVATE', payload: 'showBackComponent'})
	  }}>
		DM
    </button>
  );
};

export default ChatButtonComponent;
 