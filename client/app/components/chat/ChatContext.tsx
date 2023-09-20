// ChatContext.tsx
import React, { createContext, useContext, useState } from 'react';

// Créez un contexte
const ChatContext = createContext<{
	showFriendsList: boolean;
	activateFriendsList: () => void;
	disableFriendsList: () => void;
	handleFriendsList: () => void;
	showDiscussionList: boolean;
	activateDiscussionList: () => void;
	disableDiscussionList: () => void;
	handleDiscussionList: () => void;
	showAdd: boolean;
	handleAdd: () => void;
	activateAdd: () => void;
	disableAdd: () => void;
	showChatDiscussion: boolean;
	activateChatDiscussion: () => void;
	disableChatDiscussion: () => void;
	handleChatDiscussion: () => void;
} | undefined>(undefined);

// Créez un fournisseur de contexte
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [showFriendsList, setFriendsList] = useState(false);
	const [showDiscussionList, setDiscussionList] = useState(false);
	const [showAdd, setAdd] = useState(false);
	const [showChatDiscussion, setChatDiscussion] = useState(false);
  

	const activateFriendsList = () => setFriendsList(true);
	const disableFriendsList = () => setFriendsList(false);

	const handleFriendsList = () => {
		disableDiscussionList();
		disableAdd();
		disableChatDiscussion();
		activateFriendsList();
	}

	const activateDiscussionList = () => setDiscussionList(true);
	const disableDiscussionList = () => setDiscussionList(false);

	const handleDiscussionList = () => {
		disableFriendsList();
		disableAdd();
		disableChatDiscussion();
		activateDiscussionList();
	}

	const activateChatDiscussion = () => setChatDiscussion(true);
	const disableChatDiscussion = () => setChatDiscussion(false);
	const handleChatDiscussion = () => {
		disableDiscussionList();
		disableFriendsList();
		disableAdd();
		activateChatDiscussion();
	}
	const activateAdd = () => setAdd(true);
	const disableAdd = () => setAdd(false);

	const handleAdd = () => {
		disableDiscussionList();
		disableFriendsList();
		disableChatDiscussion();
		activateAdd();
	}


	return (
	<ChatContext.Provider
		value={{
		showFriendsList,
		handleFriendsList,
		activateFriendsList,
		disableFriendsList,
		
		activateAdd,
		handleAdd,
		showAdd,
		disableAdd,
		
		handleDiscussionList,
		showDiscussionList,
		activateDiscussionList,
		disableDiscussionList,

		handleChatDiscussion,
		showChatDiscussion,
		activateChatDiscussion,
		disableChatDiscussion,
		}}
	>
		{children}
	</ChatContext.Provider>
	);
};

// Créez un hook personnalisé pour utiliser le contexte
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
	throw new Error('useChat doit être utilisé dans un ChatProvider');
  }
  return context;
};
