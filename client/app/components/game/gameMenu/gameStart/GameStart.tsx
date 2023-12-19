import './GameStart.css'
import React from 'react';
import { useGame } from '../../GameContext';
import { Socket } from 'socket.io-client'

const MatchMaking = (socket: {socket: Socket}) => {

    const {showGameMenu, handleGameMenu} = useGame();
    return (
        <div className="matchmakingClass">
            <div className="cs-loader">
                <div className="cs-loader-inner">
                    <label>●</label>
                    <label>●</label>
                    <label>●</label>
                    <label>●</label>
                    <label>●</label>
                    <label>●</label>
                </div>
            </div>
                    <button className={`cancel-button ${showGameMenu ? 'clicked' : ''}`} onClick={handleGameMenu}>Cancel</button>
        </div>
    );
};
export default MatchMaking