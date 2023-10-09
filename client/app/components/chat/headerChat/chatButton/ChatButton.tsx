// import Image from './chat.png';  // Le chemin commence à partir de la racine du dossier 'public'
import './ChatButton.css';
import React from 'react';
import { useChat } from '../../ChatContext';

const ChatButtonComponent: React.FC = () => {
  const { state, dispatch } = useChat();

  return (
    <button
      className={`main-button-chat ${state.showChatList ? 'clicked' : ''}`}
      onClick={() => dispatch({ type: 'TOGGLE', payload: 'showChatList' })}
    >
      <img src='./images/chat.png' alt="logo" />
    </button>
  );
};

export default ChatButtonComponent;