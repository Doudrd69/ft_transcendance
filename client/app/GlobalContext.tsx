// ChatContext.tsx
import React, { createContext, useContext, useReducer } from 'react';

// Définir les types d'action
type ActionType =
  | 'ACTIVATE'
  | 'DISABLE'
  | 'TOGGLE'
  | 'SET'
  | 'TOGGLEX'

// Définir l'interface de l'action
interface Action {
  type: ActionType;
  payload?: boolean |string | null | { avatar: string } |undefined; // Utilisé pour les actions qui ont un payload
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


	avatar:string
	[key: string]: boolean | string | null;
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
	showUploadAvatar:true,
	showHeader:false,
	showRefresh:false,
	avatar:"",
};

// Réducteur
const chatReducer = (state: GlobalState, action: Action): GlobalState => {
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
	  default:
		return state;
	}
  };
// Contexte
const GlobalContext = createContext<{
  state: GlobalState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Fournisseur de contexte
export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({children,}) => {
	const [state, dispatch] = useReducer(chatReducer, initialState);
	
	return (
		<GlobalContext.Provider value={{ state, dispatch }}>
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
