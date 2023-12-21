import './gameSettings.css'
import React from 'react';
import { useGame } from '../../GameContext';

const Settings: React.FC = () => {

    const { state, dispatch } = useGame();

    const handleToggleSettingsGame = () => {

        dispatch({
            type: 'TOGGLE',
            payload: 'showSettingsGame',
        });
        dispatch({
            type: 'ACTIVATE',
            payload: 'showGameSettings',
        });
    };

    const handleToggleSettingsDisplay = () => {

        dispatch({
            type: 'TOGGLE',
            payload: 'showSettingsDisplay',
        });
        dispatch({
            type: 'ACTIVATE',
            payload: 'showGameSettings',
        });
    };

    const handleToggleSettingsKeyboard = () => {

        dispatch({
            type: 'TOGGLE',
            payload: 'showSettingsKeyboard',
        });
        dispatch({
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
                    <button className={`menu-button ${state.showGameMenu ? 'clicked' : ''}`} onClick={() => dispatch({ type: 'TOGGLE', payload: 'showGameMenu' })}>Menu</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;