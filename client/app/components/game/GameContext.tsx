import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext<{
    showGameMatchmaking: boolean;
    activateGameMatchmaking: () => void;
	disableGameMatchmaking: () => void;
	handleGameMatchmaking: () => void;
    showGameSettings:boolean,
    activateGameSettings: () => void;
	disableGameSettings: () => void;
	handleGameSettings: () => void;
    showGameMenu: boolean;
    activateGameMenu: () => void;
	disableGameMenu: () => void;
	handleGameMenu: () => void;
} | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [showGameMatchmaking, setGameMatchmaking] = useState(false);
    const [showGameSettings, setGameSettings] = useState(false);
    const [showGameMenu, setGameMenu] = useState(true);

    const activateGameMatchmaking = () => setGameMatchmaking(true);
	const disableGameMatchmaking = () => setGameMatchmaking(false);

	const handleGameMatchmaking = () => {
		disableGameMenu();
		disableGameSettings();
        activateGameMatchmaking();
	}

    const activateGameMenu = () => setGameMenu(true);
	const disableGameMenu = () => setGameMenu(false);

	const handleGameMenu = () => {
		disableGameMatchmaking();
		disableGameSettings();
        activateGameMenu();
	}

    const activateGameSettings = () => setGameSettings(true);
	const disableGameSettings = () => setGameSettings(false);

	const handleGameSettings = () => {
		disableGameMenu();
		disableGameMatchmaking();
        activateGameSettings();
	}

	return (
	<GameContext.Provider
		value={{
            showGameMatchmaking,
            handleGameMatchmaking,
            activateGameMatchmaking,
            disableGameMatchmaking,

            showGameMenu,
            handleGameMenu,
            activateGameMenu,
            disableGameMenu,

            showGameSettings,
            handleGameSettings,
            activateGameSettings,
            disableGameSettings,

		}}
	>
		{children}
	</GameContext.Provider>
	);
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
      throw new Error('useGame doit être utilisé dans un GameProvider');
    }
    return context;
  };