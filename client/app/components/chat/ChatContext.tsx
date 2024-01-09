// ChatContext.tsx
import React, { createContext, useContext, useReducer } from 'react';

// Définir les types d'action
type ActionType =
  | 'ACTIVATE'
  | 'DISABLE'
  | 'TOGGLE'
  | 'SET'
  | 'TOGGLEX'
  | 'SET_CURRENT_CONVERSATION_NAME'
  | 'SET_CURRENT_CONVERSATION'
  | 'SET_CURRENT_CHANNEL'
  | 'SET_CURRENT_ROOM'
  | 'SET_CURRENT_CONVERSATION_ID';

// Définir l'interface de l'action
interface Action {
  type: ActionType;
  payload?: string | null | undefined; // Utilisé pour les actions qui ont un payload
}

// Définir l'interface de l'état
interface ChatState {
	showFriendsList: boolean;
	showAdd: boolean;
	showChatList: boolean;
	showAddChannel: boolean;
	showChat: boolean;
	showChannelList: boolean;
	showChannel: boolean;
	showSettings: boolean;
	showUser:false,
	showAddFriend:false,
	showConfirmation:boolean,
	showAddUser: boolean;
	showAvatar: boolean;
	showListChannelAdd:boolean,
	refreshChannel:boolean,
	refreshFriendsList:boolean,
	currentConversation: string | null;
	currentConversationName: string | null;
	currentConversationID: number | null;
	currentChannel: string | null;
	currentRoom: string | null;
	[key: string]: boolean | number | string | null;
}

// État initial
const initialState: ChatState = {
	showFriendsList: false,
	showChatList: false,
	showChannelList: true,
	showAddChannel: false,
	showAddUser: false,
	showAddFriend:false,
	showChat: false,
	showChannel: false,
	showAdd: false,
	showSettings: false,
	showUser:false,
	showAvatar: false,
	showConfirmation:false,
	showListChannelAdd:false,
	refreshChannel:false,
	refreshFriendsList:false,
	currentConversation: null,
	currentConversationID: null,
	currentConversationName: null,
	currentChannel: null,
	currentRoom: null,
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
		  		acc[key] = key === action.payload ? true : false;
		  	return acc;
			}, {} as ChatState);
		case 'TOGGLEX':
				return { ...state, [action.payload as string]: !state[action.payload as string] };
		case 'SET':
			if (typeof action.payload === 'object' && action.payload !== null) {
			  return Object.assign({}, state, action.payload);
			} else {
			  // Gérer le cas où action.payload n'est pas un objet
			  return state;
			}
		case 'SET_CURRENT_CONVERSATION':
			return { ...state, currentConversation: action.payload || null }; // Mettre à jour la conversation actuelle 
		case 'SET_CURRENT_CONVERSATION_NAME':
			return { ...state, currentConversationName: action.payload || null };
		case 'SET_CURRENT_CHANNEL':
			return { ...state, currentChannel: action.payload || null };
		case 'SET_CURRENT_ROOM':
			return { ...state, currentRoom: action.payload || null }; 
		case 'SET_CURRENT_CONVERSATION_ID':
			return { ...state, currentConversationID: action.payload ? parseInt(action.payload, 10) : null};
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
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
	const [state, dispatch] = useReducer(chatReducer, initialState);
	
	return (
		<ChatContext.Provider value={{ state, dispatch }}>
			{children}
		</ChatContext.Provider>
	);
};

export const setCurrentConversation = (payload: string | null): Action => ({
	type: 'SET_CURRENT_CONVERSATION',
	payload,
});

export const setCurrentConversationName = (payload: string | null): Action => ({
	type: 'SET_CURRENT_CONVERSATION',
	payload,
});

export const setCurrentRoom = (payload: string | null): Action => ({
	type: 'SET_CURRENT_ROOM',
	payload,
});

export const setCurrentConversationID = (payload: string | null): Action => ({
	type: 'SET_CURRENT_CONVERSATION_ID',
	payload,
});
  
// Hook personnalisé pour utiliser le contexte
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
	throw new Error('useChat doit être utilisé dans un ChatProvider');
  }
  return context;
};
