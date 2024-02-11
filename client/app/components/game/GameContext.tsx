import React, { createContext, useContext, useReducer } from 'react';

type ActionType =
  | 'ACTIVATE'
  | 'DISABLE'
  | 'TOGGLE'
  | 'SET'

  interface Action {
	type: ActionType;
	payload?: string | undefined; // Utilisé pour les actions qui ont un payload
  }

// Définir l'interface de l'état
interface GameState {
	showGameMatchmaking: boolean;
	showGameSettings: boolean;
	showGameMenu: boolean;
	showSettingsGame: boolean;
	showSettingsDisplay: boolean;
	showSettingsKeyboard: boolean;
	showGame: boolean;
	[key: string]: boolean | number | string;
}

const initialState: GameState = {
	showGameMatchmaking: false,
	showGameSettings: false,
	showGameMenu: true,
	showSettingsGame: false,
	showSettingsDisplay: false,
	showSettingsKeyboard: false,
	showGame: false,
  };

  // Réducteur
const GameReducer = (state: GameState, action: Action): GameState => {
	switch (action.type) {
		case 'ACTIVATE':
			return { ...state, [action.payload!]: true };
	  	case 'DISABLE':
			return { ...state, [action.payload!]: false };
		case 'TOGGLE':
			return Object.keys(state).reduce((acc, key) => {
		  		acc[key] = key === action.payload ? true : false;
		  	return acc;
			}, {} as GameState);
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
const GameContext = createContext<{
  state: GameState;
  dispatchGame: React.Dispatch<Action>;
} | undefined>(undefined);

// Fournisseur de contexte
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
	const [state, dispatchGame] = useReducer(GameReducer, initialState);
	
	return (
		<GameContext.Provider value={{ state, dispatchGame }}>
		{children}
		</GameContext.Provider>
	);
};
  
// Hook personnalisé pour utiliser le contexte
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
	throw new Error('useGame doit être utilisé dans un GameProvider');
  }
  return context;
};