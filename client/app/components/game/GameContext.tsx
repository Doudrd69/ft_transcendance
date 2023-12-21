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
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Fournisseur de contexte
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
	const [state, dispatch] = useReducer(GameReducer, initialState);
	
	return (
		<GameContext.Provider value={{ state, dispatch }}>
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

// const GameContext = createContext<{
//     showGameMatchmaking: boolean;
//     activateGameMatchmaking: () => void;
// 	disableGameMatchmaking: () => void;
// 	handleGameMatchmaking: () => void;
//     showGameSettings:boolean,
//     activateGameSettings: () => void;
// 	disableGameSettings: () => void;
// 	handleGameSettings: () => void;
//     showGameMenu: boolean;
//     activateGameMenu: () => void;
// 	disableGameMenu: () => void;
// 	handleGameMenu: () => void;
//     showSettingsGame: boolean;
//     activateSettingsGame: () => void;
// 	disableSettingsGame: () => void;
// 	handleSettingsGame: () => void;
//     showSettingsDisplay:boolean,
//     activateSettingsDisplay: () => void;
// 	disableSettingsDisplay: () => void;
// 	handleSettingsDisplay: () => void;
//     showSettingsKeyboard: boolean;
//     activateSettingsKeyboard: () => void;
// 	disableSettingsKeyboard: () => void;
// 	handleSettingsKeyboard: () => void;
// } | undefined>(undefined);

// export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const [showGameMatchmaking, setGameMatchmaking] = useState(false);
//     const [showGameSettings, setGameSettings] = useState(false);
//     const [showGameMenu, setGameMenu] = useState(true);
//     const [showSettingsGame, setSettingsGame] = useState(false);
//     const [showSettingsDisplay, setSettingsDisplay] = useState(false);
//     const [showSettingsKeyboard, setSettingsKeyboard] = useState(false);

//     const activateGameMatchmaking = () => setGameMatchmaking(true);
// 	const disableGameMatchmaking = () => setGameMatchmaking(false);

// 	const handleGameMatchmaking = () => {
// 		disableGameMenu();
// 		disableGameSettings();
//         activateGameMatchmaking();
// 	}

//     const activateGameMenu = () => setGameMenu(true);
// 	const disableGameMenu = () => setGameMenu(false);

// 	const handleGameMenu = () => {
// 		disableGameMatchmaking();
// 		disableGameSettings();
//         disableSettingsDisplay();
//         disableSettingsGame();
//         disableSettingsKeyboard();
//         activateGameMenu();
// 	}

//     const activateGameSettings = () => setGameSettings(true);
// 	const disableGameSettings = () => setGameSettings(false);

// 	const handleGameSettings = () => {
// 		disableGameMenu();
// 		disableGameMatchmaking();
//         activateGameSettings();
//         activateSettingsGame();        
// 	}

//     const activateSettingsGame = () => setSettingsGame(true);
// 	const disableSettingsGame = () => setSettingsGame(false);

// 	const handleSettingsGame = () => {
// 		disableSettingsDisplay();
// 		disableSettingsKeyboard();
// 	}

//     const activateSettingsDisplay = () => setSettingsDisplay(true);
// 	const disableSettingsDisplay = () => setSettingsDisplay(false);

// 	const handleSettingsDisplay = () => {
// 		disableSettingsGame();
// 		disableSettingsKeyboard();
//         activateSettingsDisplay();
// 	}

//     const activateSettingsKeyboard = () => setSettingsKeyboard(true);
// 	const disableSettingsKeyboard = () => setSettingsKeyboard(false);

// 	const handleSettingsKeyboard= () => {
// 		disableSettingsGame();
// 		disableSettingsDisplay();
//         activateSettingsKeyboard();
// 	}

// 	return (
// 	<GameContext.Provider
// 		value={{
//             showGameMatchmaking,
//             handleGameMatchmaking,
//             activateGameMatchmaking,
//             disableGameMatchmaking,

//             showGameMenu,
//             handleGameMenu,
//             activateGameMenu,
//             disableGameMenu,

//             showGameSettings,
//             handleGameSettings,
//             activateGameSettings,
//             disableGameSettings,

//             showSettingsGame,
//             handleSettingsGame,
//             activateSettingsGame,
//             disableSettingsGame,

//             showSettingsDisplay,
//             handleSettingsDisplay,
//             activateSettingsDisplay,
//             disableSettingsDisplay,

//             showSettingsKeyboard,
//             handleSettingsKeyboard,
//             activateSettingsKeyboard,
//             disableSettingsKeyboard,

// 		}}
// 	>
// 		{children}
// 	</GameContext.Provider>
// 	);
// };

// export const useGame = () => {
//     const context = useContext(GameContext);
//     if (context === undefined) {
//       throw new Error('useGame doit être utilisé dans un GameProvider');
//     }
//     return context;
//   };

  /**
   * REGARDER USE REDUCER hook react native pour stocker les usestates
   * 
   */