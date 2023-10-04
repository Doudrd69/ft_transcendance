import './GameMenu.css'
import React from 'react';
import MatchMaking from './gameStart/GameStart'
import Settings from './gameSettings/gameSettings'
import {useGame } from '../GameContext'


const Menu: React.FC = () => {

  const {showGameMatchmaking, showGameSettings, handleGameSettings, handleGameMatchmaking} = useGame();
  return (
    <div className="background-game">
      <div className="paddle paddle-left">
        <div className="solid">
          <div className="surface"></div>
          <div className="hold">
            <div className="top"></div>
            <div className="transition"></div>
            <div className="handle"></div>
          </div>
        </div>
        <div className="wiggly">
          <div className="string"></div>
          <div className="ball"></div>
        </div>
      </div>
      <div className="paddle paddle-right">
        <div className="solid">
          <div className="surface"></div>
          <div className="hold">
            <div className="top"></div>
            <div className="transition"></div>
            <div className="handle"></div>
          </div>
        </div>
        <div className="wiggly">
          <div className="string"></div>
          <div className="ball"></div>
        </div>
      </div>
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

export default Menu;