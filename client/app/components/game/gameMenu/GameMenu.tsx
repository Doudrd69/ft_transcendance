import './GameMenu.css'
import MatchMaking from './gameStart/GameStart'
import Settings from './gameSettings/gameSettings'
import {useGame } from '../GameContext'
import React, { useState } from 'react';


const Menu: React.FC = () => {

  const {showGameMatchmaking, showGameSettings, handleGameSettings, handleGameMatchmaking} = useGame();
  
  const handleStartClick = async () => {
    const response = await fetch('http://localhost:3001/game/join', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(player),
		});
    
		if (response.ok) {
			console.log('Player successfully join the lobby :', response.statusText );
		}
		else {
			console.log("Player can't join the lobby");
		}
		return false;
  };

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
        <button className={`buttonclass ${showGameMatchmaking ? 'clicked' : ''}`} onClick={() =>{ handleStartClick(); handleGameMatchmaking(); }}>START GAME</button>
        <button className="buttonclass" >PROFILE</button>
        <button className={`buttonclass ${showGameSettings ? 'clicked' : ''}`} onClick={handleGameSettings}>SETTINGS</button>
      </div>
    </div>
  );
};

export default Menu;