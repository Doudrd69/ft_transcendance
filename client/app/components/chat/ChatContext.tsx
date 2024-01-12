// ChatContext.tsx
import React, { createContext, useContext, useReducer } from 'react';

// Définir les types d'action
interface userList {
	login: string;
	avatarURL: string;
	isAdmin: boolean;
	isMute: boolean;
	isBan: boolean;
}

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
  | 'SET_CURRENT_USER_LIST'
  | 'SET_CURRENT_CONVERSATION_ID'
  | 'SET_CURRENT_OPTION_CHANNEL_NAME'
  | 'SET_CURRENT_FRIEND'
  |'SET_CURRENT_CONVERSATION_IS_PRIVATE'
  | 'SET_CURRENT_CONVERSATION_IS_PROTECTED';
// Définir l'interface de l'action
interface Action {
  type: ActionType;
  payload?: string | any | null | undefined; // Utilisé pour les actions qui ont un payload
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
	showCreateChannel: boolean;
	showListChannelAdd:boolean,
	refreshChannel:boolean,
	refreshFriendsList:boolean,
	currentConversation: string | null;
	currentConversationName: string | null;
	currentConversationID: number | null;
	currentChannel: string | null;
	currentRoom: string | null;
	currentUserList: any;
	isAdmin: boolean;
	showAddCreateChannel:boolean;
	showOptionsChannel:boolean;
	currentOptionChannelName:string | null;
	currentFriend: string | null;
	currentChannelBool: boolean;
	showPassword: boolean;
	showOptionsUserChannel: boolean;
	showAdmin: boolean;
	currentConversationIsProtected: boolean;
	currentConversationIsPrivate: boolean;
	showPasswordChange:boolean;
	[key: string]: boolean  |number | string | null;
}

// État initial
const initialState: ChatState = {
	currentConversationIsPrivate: false,
	currentConversationIsProtected: false,
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
	showCreateChannel: false,
	showAddCreateChannel:false,
	showOptionsChannel:false,
	currentRoom: null,
	currentUserList: null,
	currentFriend: null,
	currentConvID: null,
	showPassword: false,
	showAdmin: false,
	isAdmin: false,
	currentOptionChannelName:'',
	showOptionsUserChannel: false,
	currentChannelBool: false,
	showPasswordChange:false,

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
		case 'SET_CURRENT_USER_LIST':
				return { ...state, currentUserList: action.payload || null }; 
		case 'SET_CURRENT_CONVERSATION_ID':
			return { ...state, currentConversationID: action.payload ? parseInt(action.payload, 10) : null};
		case 'SET_CURRENT_OPTION_CHANNEL_NAME':
			return { ...state, currentOptionChannelName: action.payload || null };
		case 'SET_CURRENT_FRIEND':
			return { ...state, currentFriend: action.payload || null };
		case 'SET_CURRENT_CONVERSATION_IS_PRIVATE':
				return {...state, currentConversationIsPrivate: action.payload,};
		case 'SET_CURRENT_CONVERSATION_IS_PROTECTED':
				return {...state, currentConversationIsProtected: action.payload,};
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

export const setCurrentUserLis = (payload: any | null): Action => ({
	type: 'SET_CURRENT_USER_LIST',
	payload,
});

export const setCurrentOptionChannelName = (payload: string | null): Action => ({
	type: 'SET_CURRENT_OPTION_CHANNEL_NAME',
	payload,
});

export const setCurrentFriend = (payload: string | null): Action => ({
	type: 'SET_CURRENT_FRIEND',
	payload,
});

export const setCurrentConversationIsPrivate = (payload: boolean): Action => ({
	type: 'SET_CURRENT_CONVERSATION_IS_PRIVATE',
	payload,
});

export const setCurrentConversationIsProtected = (payload: boolean): Action => ({
	type: 'SET_CURRENT_CONVERSATION_IS_PROTECTED',
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
