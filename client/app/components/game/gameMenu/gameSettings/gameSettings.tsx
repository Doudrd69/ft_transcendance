import './gameSettings.css'
import React from 'react';
import { useGame } from '../../GameContext';

const Settings: React.FC = () => {

    const {showGameMenu, handleGameMenu} = useGame();
    return (
        <div className="settingsBlock">
                <p>settings</p>
            <div className="customGameBlock">
                <div className="setting-option">
                    <label>The taller:</label>
                    <select id="option1">
                    <option>wmonacho</option>
                    <option>ebrodeur</option>
                    <option>mroffi</option>
                    </select>
                </div>
                <div className="setting-option">
                    <label>The strongest:</label>
                    <select id="option2">
                    <option>ebrodeur</option>
                    <option>mroffi</option>
                    <option>wmonacho</option>
                    </select>
                </div>
            </div>
            <div className="graphiqueGameBlock">
                <div className="setting-option">
                    <label>The most beautiful:</label>
                    <select id="option3">
                    <option>mroffi</option>
                    <option>wmonacho</option>
                    <option>ebrodeur</option>
                    </select>
                </div>
            </div>
            <div className="optionBlock">
                <div className="cancel-button-container">
                    <button className={`cancel-button ${showGameMenu ? 'clicked' : ''}`} onClick={handleGameMenu}>Menu</button>
                </div>
            </div>
        </div>
    );
};

export default Settings