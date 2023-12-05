// ChatContext.tsx
import React, { createContext, useContext, useReducer } from 'react';

// Définir les types d'action
type ActionType =
  | 'ACTIVATE'
  | 'DISABLE'
  | 'TOGGLE'
  | 'SET';

// Définir l'interface de l'action
interface Action {
  type: ActionType;
  payload?: string; // Utilisé pour les actions qui ont un payload
}

// Définir l'interface de l'état
interface ChatState {
  showFriendsList: boolean;
  showAdd: boolean;
  showChatList: boolean;
  showChat: boolean;
  showChannelList: boolean;
  showChannel: boolean;
  [key: string]: boolean;
}

// État initial
const initialState: ChatState = {
  showFriendsList: false,
  showChatList: false,
  showChannelList: false,
  showChat: false,
  showChannel: false,
  showAdd: false,
};

// Réducteur
const chatReducer = (state: ChatState, action: Action): ChatState => {
	switch (action.type) {
		case 'ACTIVATE':
			return { ...state, [action.payload!]: true };
	  	case 'DISABLE':
			return { ...state, [action.payload!]: false };
		case 'TOGGLE':
			return Object.keys(state).reduce((acc, key) => {
		  		acc[key] = key === action.payload ? !state[key] : false;
		  	return acc;
			}, {} as ChatState);
		case 'SET':
			if (typeof action.payload === 'object' && action.payload !== null) {
			  return Object.assign({}, state, action.payload);
			} else {
			  // Gérer le cas où action.payload n'est pas un objet
			  return state;
			}
		  
	  default:
		return state;
	}
  };
  
  

// Contexte
const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Fournisseur de contexte
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat doit être utilisé dans un ChatProvider');
  }
  return context;
};
