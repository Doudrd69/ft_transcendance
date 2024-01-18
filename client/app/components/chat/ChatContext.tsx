// ChatContext.tsx
import React, { createContext, useContext, useReducer } from 'react';

import { Channel, ConversationChannel, ConversationDm, UserChannel, UserDm } from './types';
import { Caesar_Dressing } from 'next/font/google';
// // Définir les types d'action

type ActionType =
  | 'ACTIVATE'
  | 'DISABLE'
  | 'TOGGLE'
  | 'SET'
  | 'TOGGLEX'
  | 'SET_CURRENT_CONVERSATION_NAME'
  | 'SET_CURRENT_CHANNEL'
  | 'SET_CURRENT_ROOM'
  | 'SET_CURRENT_CONVERSATION_ID'
  | 'SET_CURRENT_OPTION_CHANNEL_NAME'
  | 'SET_CURRENT_FRIEND'
  |	'SET_CURRENT_CONVERSATION_IS_PRIVATE'
  | 'SET_CURRENT_CONVERSATION_IS_PROTECTED'
  | 'SET_CURRENT_COMPONENT'
  | 'SET_CONVERSATIONS_USERS'
  /*FRIENDSLIST*/
  | 'SET_FRIENDS_LIST'
  /*ME*/
  | 'SET_CURRENT_USER'
  | 'SET_CURRENT_CONVERSATION'
  | 'SET_CURRENT_USER_LIST'
  /*CONVERSATIONSLIST*/
  | 'SET_CONVERSATIONS_LIST'

  ///////////////////////////////////////////
  /*CURRENT_CHANNEL*/
  | 'SET_CHANNEL_LIST'
  | 'SET_CURRENT_CHANNEL_USER_LIST'
  | 'SET_CURRENT_CHANNEL'
  | 'SET_CURRENT_USER_CHANNEL'
  
  /*DM*/
  | 'SET_DM_LIST'
  | 'SET_CURRENT_DM'
  |	'SET_CURRENT_DM_USER'
  

  /*TARGET*/
  | 'SET_TARGET_USER'
  /////////////////////////////////////////////////

// Définir l'interface de l'action
interface Action {
  type: ActionType;
  payload?: string | any |  null | undefined; // Utilisé pour les actions qui ont un payload
}

// Définir l'interface de l'état

interface ChatState {

	/*Affichage des composants*/
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
	showPassword: boolean;
	showOptionsUserChannel: boolean;
	showOptionsUserChannelOwner: boolean;
	showOptionsChannel:boolean;
	showAddCreateChannel:boolean;
	showPasswordChange:boolean;
	showBackComponent: boolean;
	showAdmin: boolean;
	
	/*refresh*/
	refreshChannel:boolean,
	refreshFriendsList:boolean,

	/*FRIENDSLIST*/
	friendlist : any;

	/*CONVERSATIONS*/
	currentConversation: any | null;
	currentConversationName: string | null;
	currentConversationID: number | null;
	currentRoom: string | null;
	currentOptionChannelName:string | null;
	currentConversationIsProtected: boolean;
	currentConversationIsPrivate: boolean;
	currentChannelBool: boolean;

//////////////////////////////////////////////
	/*CHannelLIST*/
	channelList: Channel []| null;
	currentChannel : ConversationChannel | null;
	currentChannelUserList: UserChannel[] | null;
	currentUserChannel: UserChannel | null;
	
	/*DM_LIST*/
	dmList: ConversationDm[] | null;
	curenntDm: ConversationDm | null;
	currentUserDm: UserDm | null;

	/*USER: TARGET*/
	targetUser: UserChannel | null;
//////////////////////////////////////////////


	isAdmin: boolean;
	currentIsAdmin: boolean;
	currentFriend: string | null;
	currentComponent: string | null; 


	[key: string]: string | number | boolean | ConversationChannel | ConversationDm | ConversationDm[] | Channel | Channel []  | UserChannel[] | UserDm | null;
}

// État initial
const initialState: ChatState = {

	/*Affichage des composants*/
	showChatList: false,
	showFriendsList: false,
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
	showCreateChannel: false,
	showAddCreateChannel:false,
	showOptionsChannel:false,
	showOptionsUserChannelOwner: false,
	showOptionsUserChannel: false,
	showPasswordChange:false,
	showBackComponent: true,
	showPassword: false,
	showAdmin: false,

	/*refresh*/
	refreshChannel:false,
	refreshFriendsList:false,

	/*FRIENDSLIST*/
	friendlist : null,

	/*CONVERSATIONSLIST */
	conversationsList: null,
	/*CHANNELLIST*/
	channelList: null,

	/*CONVERSATIONS*/
	currentConversationIsPrivate: false,
	currentConversationIsProtected: false,
	currentConversation: null,
	currentConversationID: null,
	currentConversationName: null,
	currentRoom: null,
	currentConvID: null,
	currentOptionChannelName:'',
	currentChannelBool: false,



	//////////////////////////////////////////////
	/*CHANNEL*/
	ChannelList: null,
	currentChannel: null,
	currentChannelUserList: null,
	currentUserChannel: null,
	/*DM*/
	dmList: null,
	curenntDm: null,
	currentUserDm: null,

	/*TARGET*/
	targetUser: null,
	//////////////////////////////////////////////



	/*CURRENTU_USER*/
	cuurentUserList: null,

	isAdmin: false,
	currentComponent: '',
	currentIsAdmin: false,
	currentFriend: null,
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
				if (key !== 'userList') {
		  			acc[key] = key === action.payload ? true : false;
				}
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

///////////////////////////////////////
		//CHannel
		case 'SET_CHANNEL_LIST':
			return { ...state, channelList: action.payload || null };
		case 'SET_CURRENT_CHANNEL':
			return { ...state, currentChannel: action.payload || null };
		case 'SET_CURRENT_CHANNEL_USER_LIST':
				return { ...state, currentChannelUserList: action.payload || null };
		case 'SET_CURRENT_USER_CHANNEL':
				return { ...state, currentUserChannel: action.payload || null };
		//DM
		case 'SET_DM_LIST':
			return { ...state, dmList: action.payload || null }
		case 'SET_CURRENT_DM':
			return { ...state, currentChannel: action.payload || null };
			
		//User
		case 'SET_TARGET_USER':
			return { ...state, targetUser: action.payload || null };
////////////////////////////////////////


		case 'SET_CURRENT_OPTION_CHANNEL_NAME':
			return { ...state, currentOptionChannelName: action.payload || null };
		//TMP COMPONANT
		case 'SET_CURRENT_COMPONENT':
			return { ...state, currentComponent: action.payload || null };
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


////////////////////////////////////////////////////////////
///CHANNEL
	export const setChannelList = (payload: Channel[] | null): Action => ({
		type: 'SET_CHANNEL_LIST',
		payload,
	});
	export const setCurrentChannel = (payload: ConversationChannel | null): Action => ({
		type: 'SET_CURRENT_CHANNEL',
		payload,
	});

	export const setCurrentChannelUserList = (payload: UserChannel[] | null): Action => ({
	type: 'SET_CURRENT_CHANNEL_USER_LIST',
	payload,
  });
	export const setCurrentUserChannel = (payload: UserChannel | null): Action => ({
	type: 'SET_CURRENT_USER_CHANNEL',
	payload,
  });

///DM

export const setDmList = (payload: ConversationDm[] | null): Action => ({
	type: 'SET_DM_LIST',
	payload,
  });
export const setCurrentDm = (payload: ConversationDm | null): Action => ({
	type: 'SET_CURRENT_DM',
	payload,
  });
export const setCurrentUserDm = (payload: UserDm | null): Action => ({
	type: 'SET_CURRENT_DM_USER',
	payload,
  });

///TARGET
export const setTargetUser = (payload: UserChannel | null): Action => ({
	type: 'SET_TARGET_USER',
	payload,
  });
////////////////////////////////////////////////////////////

export const setCurrentOptionChannelName = (payload: string | null): Action => ({
	type: 'SET_CURRENT_OPTION_CHANNEL_NAME',
	payload,
});



// export const setCurrentComponent = (payload: string | null): Action => ({
// 	type: 'SET_CURRENT_COMPONENT',
// 	payload,
// });

export const setCurrentComponent = (payload: string | null): Action => ({
	  type: 'SET_CURRENT_COMPONENT',
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
