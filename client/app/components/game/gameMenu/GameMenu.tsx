import './GameMenu.css'
import React from 'react';
import MatchMaking from './gameStart/GameStart'
import Settings from './gameSettings/gameSettings'
import {useGame } from '../GameContext'


const Menu: React.FC = () => {

  const {showGameMatchmaking, showGameSettings, handleGameSettings, handleGameMatchmaking} = useGame();
    return (
      <div className="background-game">
        <div className="background-game">
          <h1 className='titleClass'>PONG GAME</h1>
        </div>
        <div className="background-game">
          <button className={`buttonclass ${showGameMatchmaking ? 'clicked' : ''}`} onClick={handleGameMatchmaking}>START GAME</button>
          <button className={`buttonclass ${showGameSettings ? 'clicked' : ''}`} onClick={handleGameSettings}>PROFILE</button>
          <button className={`buttonclass ${showGameSettings ? 'clicked' : ''}`} onClick={handleGameSettings}>SETTINGS</button>
         </div>
      </div>
    );
  };
  export default Menu