import './GameMenu.css'
import MatchMaking from './gameStart/GameStart'
import Settings from './gameSettings/gameSettings'
import {useGame } from '../GameContext'
import React, { useState } from 'react';
import { Socket } from 'socket.io-client'
<<<<<<< HEAD


const Menu = (socket: {socket: Socket}) => {

  const gameSocket = socket.socket;
=======
import Home from '@/app/page';


const Menu: React.FC = () => {
>>>>>>> 534a200 (Create Queue with PlayerPairs and create Game, Try to fix socket in front, have to test some of new feature)
  const {showGameMatchmaking, showGameSettings, handleGameSettings, handleGameMatchmaking} = useGame();
  
  const handleStartClick = async () => {
    const currentUserLogin = sessionStorage.getItem("currentUserLogin");

    if (gameSocket.connected) {
<<<<<<< HEAD
        console.log("GameSocket connected");
      gameSocket.emit('create-lobby', currentUserLogin );
      gameSocket.off('message');
    }
    else {
			console.log("Socket not connected");
		}
=======
      gameSocket.emit('create-lobby', currentUserLogin );
      gameSocket.off('message');
    }
    else {
			console.log("Socket not connected");
		}

    if (currentUserLogin !== null) {
    const response = await fetch('http://localhost:3001/game/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerName: currentUserLogin }), // Sending an object with playerName property
    });

    if (response.ok) {
      console.log('Player successfully joined the lobby:', response.statusText);
    } else {
      console.log(response.statusText);
      console.log("Player can't join the lobby");
    }
  } else {
    console.log('currentUserLogin is null');
  }
>>>>>>> 534a200 (Create Queue with PlayerPairs and create Game, Try to fix socket in front, have to test some of new feature)
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