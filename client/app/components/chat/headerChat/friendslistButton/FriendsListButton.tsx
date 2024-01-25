import './FriendsListButton.css';
import React from 'react';
import { useChat } from '../../ChatContext';

const FriendsListButtonComponent: React.FC = () => {
  const { chatState, chatDispatch } = useChat();

  return (
    <button
      className={`main-button-friendslist ${state.showFriendsList ? 'clicked' : ''}`}
      onClick={() => dispatch({ type: 'TOGGLE', payload: 'showFriendsList' })}
    >
      Friends
    </button>
  );
};

export default FriendsListButtonComponent;