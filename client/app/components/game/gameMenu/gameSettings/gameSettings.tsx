import './gameSettings.css'
import React from 'react';
import { useGame } from '../../GameContext';

const Settings: React.FC = () => {

    const { state, dispatchGame } = useGame();

    const handleToggleSettingsGame = () => {

        dispatchGame({
            type: 'TOGGLE',
            payload: 'showSettingsGame',
        });
        dispatchGame({
            type: 'ACTIVATE',
            payload: 'showGameSettings',
        });
    };

    const handleToggleSettingsDisplay = () => {

        dispatchGame({
            type: 'TOGGLE',
            payload: 'showSettingsDisplay',
        });
        dispatchGame({
            type: 'ACTIVATE',
            payload: 'showGameSettings',
        });
    };

    const handleToggleSettingsKeyboard = () => {

        dispatchGame({
            type: 'TOGGLE',
            payload: 'showSettingsKeyboard',
        });
        dispatchGame({
            type: 'ACTIVATE',
            payload: 'showGameSettings',
        });
    };

    return (
        <div className="settings">
            <div className="settingsBlock">
                <div className="leftbox">
                    <button className={`personal ${state.showSettingsGame ? 'clicked' : ''}`} onClick={handleToggleSettingsGame}></button>
                    <button className={`display ${state.showSettingsDisplay ? 'clicked' : ''}`} onClick={handleToggleSettingsDisplay}></button>
                    <button className={`settingsButton ${state.showSettingsKeyboard ? 'clicked' : ''}`} onClick={handleToggleSettingsKeyboard}></button>
                </div>

                <div className="menu-button-container">
                    <button className={`menu-button ${state.showGameMenu ? 'clicked' : ''}`} onClick={() => dispatchGame({ type: 'TOGGLE', payload: 'showGameMenu' })}>Menu</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;