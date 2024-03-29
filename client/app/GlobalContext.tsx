// ChatContext.tsx
import React, { createContext, useContext, useReducer } from 'react';
import { io, Socket } from 'socket.io-client'

// Définir les types d'action
type ActionType =
  | 'ACTIVATE'
  | 'DISABLE'
  | 'TOGGLE'
  | 'SET'
  | 'TOGGLEX'
  | 'SET_SOCKET'
  | 'SET_GAME_SOCKET'

// Définir l'interface de l'action
interface Action {
  type: ActionType;
  payload?: boolean | string | null | { avatar: string } | Socket | undefined | any; // Utilisé pour les actions qui ont un payload
}

// Définir l'interface de l'état
interface GlobalState {
	showSettings: boolean;
	showProfilsSettings: boolean;
	showGameSettings: boolean;
	showGeneralSettings:boolean;
	showGame: boolean;
	showChat:boolean;
	showAvatar:boolean;
	showHeader:boolean;
	showUploadAvatar:boolean;
	showRefresh:boolean;
	showIsDefault:boolean;
	avatar:string;
	gameUserId: number;
	gameTargetId: number;
	targetUsername: string;
	gameInvite: boolean;
	userSocket: Socket | undefined;
	gameSocket: Socket | undefined;
	show2FA: boolean;
	isConnected: boolean;
	showAuth: boolean;
	activate2FA: boolean;
	gameInviteValidation: boolean;
	gameSocketConnected: boolean;
	gameMode: string;
	userTwoIdGame: number;
	userTwoGameSocketId: string;

	[key: string]: boolean | string | Socket | undefined | number | null;
}

// État initial
const initialState: GlobalState = {
	showSettings: false,
	showProfilsSettings: false,
	showGameSettings: false,
	showGeneralSettings:false,
	showGame: true,
	showChat: true,
	showAvatar:false,
	gameInvite: false,
	gameUserId: 0,
	gameTargetId: 0,
	targetUsername: "",
	showUploadAvatar:true,
	showHeader:false,
	showRefresh:false,
	showIsDefault:false,
	avatar:"",
	userSocket: undefined,
	gameSocket: undefined,
	show2FA: false,
	activate2FA: false,
	isConnected: false,
	showAuth: false,
	gameInviteValidation: false,
	gameSocketConnected: false,
	gameMode: "NORMAL",
	userTwoIdGame: 0,
	userTwoGameSocketId: "",
};

// Réducteur
const globalReducer = (state: GlobalState, action: Action): GlobalState => {
	switch (action.type) {
		case 'ACTIVATE':
			return { ...state, [action.payload as string]: true };
		case 'DISABLE':
			return { ...state, [action.payload as string]: false };
		case 'TOGGLEX':
			return { ...state, [action.payload as string]: !state[action.payload as string] };
		case 'TOGGLE':
			return Object.keys(state).reduce((acc, key) => {
			acc[key] = key === action.payload ? true : false;
			return acc;
			}, {} as GlobalState);
		case 'SET':
			if (action.payload !== undefined) {
			if (typeof action.payload === 'object' && action.payload !== null) {
				return Object.assign({}, state, action.payload);
			} else if (typeof action.payload === 'string') {
				return { ...state, avatar: action.payload };
			}
			}
			// Gérer le cas où action.payload n'est ni un objet ni une chaîne
			return state;
		case 'SET_SOCKET':
			return { ...state, userSocket: action.payload || null };
		case 'SET_GAME_SOCKET':
			return { ...state, gameSocket: action.payload || null };
	  default:
		return state;
	}
  };
  
  export const setSocket = (payload: Socket | undefined): Action => ({
	  type: 'SET_SOCKET',
	  payload,
  });
  
  export const setGameSocket = (payload: Socket | undefined): Action => ({
	  type: 'SET_GAME_SOCKET',
	  payload,
  });

// Contexte
const GlobalContext = createContext<{
  globalState: GlobalState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Fournisseur de contexte
export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {

	const [globalState, dispatch] = useReducer(globalReducer, initialState);
	
	return (
		<GlobalContext.Provider value={{ globalState, dispatch }}>
			{children}
		</GlobalContext.Provider>
	);
};

// Hook personnalisé pour utiliser le contexte
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
	throw new Error('useGlobal doit être utilisé dans un GlobalProvider');
  }
  return context;
};
