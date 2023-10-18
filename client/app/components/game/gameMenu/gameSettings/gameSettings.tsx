import './gameSettings.css'
import React from 'react';
import { useGame } from '../../GameContext';

const Settings: React.FC = () => {

    const {showGameMenu, handleGameMenu, showSettingsDisplay, showSettingsGame, showSettingsKeyboard, handleSettingsGame, handleSettingsDisplay, handleSettingsKeyboard} = useGame();
    return (
        <div className="settings">
            <div className="settingsBlock">
                <div className="optionBlock">
                    <div className="menu-button-container">
                        <button className={`menu-button ${showGameMenu ? 'clicked' : ''}`} onClick={handleGameMenu}>Menu</button>
                    </div>
                </div>
            </div>
            <div className="leftbox">
                <button className={`personal ${showSettingsGame? 'clicked' : ''}`} onClick={handleSettingsGame}></button>
                <button className={`display ${showSettingsDisplay? 'clicked' : ''}`} onClick={handleSettingsDisplay}></button>
                <button className={`settingsButton ${showSettingsKeyboard? 'clicked' : ''}`} onClick={handleSettingsKeyboard}></button>
            </div>
        </div>
    );
};

export default Settings