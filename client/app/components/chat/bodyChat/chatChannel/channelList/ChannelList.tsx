import './ChannelList.css';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../../ChatContext';

interface Conversation {
  id: number;
  name: string;
  is_channel: boolean;
}

const ChannelListComponent: React.FC = () => {

	const { state, dispatch } = useChat();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const user = sessionStorage.getItem("currentUserLogin");

  const loadDiscussions = async () => {
    const response = await fetch(`http://localhost:3001/chat/getConversations/${user}`, {
      method: 'GET',
    });

    if (response.ok) {
      const userData = await response.json();
      console.log("DM (groups) : ", userData);
      setConversations((prevConversations: Conversation[]) => [...prevConversations, ...userData]);
      console.log(conversations);
    } else {
      console.log("Fatal error");
    }
  };

  const userData = {
    discussion: conversations,
    online: ["on", "off", "on", "on", "off", "on", "on"],
  };

  useEffect(() => {
    console.log("Loading converssations...");
    loadDiscussions();
  }, []);

  return (
    <div className="bloc-channel-list">
      {/* boucle sur la liste des convs*/}
      {userData.discussion.map((conversation, index) => (
        conversation.is_channel && (
          <button key={index} className="button-channel-list" onClick={() => {
            dispatch({ type: 'TOGGLE', payload: 'showChat' });
            dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation.name });
          }}>
            <span>{conversation.name}</span>
          </button>
        )
      ))}
    </div>
  );
};

export default ChannelListComponent;
