import './GameMenu.css'
import MatchMaking from './gameStart/GameStart'
import Settings from './gameSettings/gameSettings'
import {useGame } from '../GameContext'
import React, { useState } from 'react';
import { Socket } from 'socket.io-client'


const Menu = (socket: {socket: Socket}) => {

  const gameSocket = socket.socket;

const {showGameMatchmaking, showGameSettings, handleGameSettings, handleGameMatchmaking} = useGame();
  
  const handleStartClick = async () => {
    const currentUserLogin = sessionStorage.getItem("currentUserLogin");

    if (gameSocket.connected) {
		console.log("GameSocket connecté")
		gameSocket.emit('join-matchmaking', currentUserLogin);
		// gameSocket.on('joinGame')
	}
	else {
		console.log("GameSocket pas connecté");
	}

	return () => {
		gameSocket.off('joinGame');
	}
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