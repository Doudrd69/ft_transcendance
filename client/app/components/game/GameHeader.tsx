import React from 'react'
import { Socket } from 'socket.io-client'
import GameComponent from './Game';
import { GameProvider } from './GameContext';


const GameHeader = () => {
	return (
		<GameProvider>
        <div className="right-half">
            <GameComponent></GameComponent>
        </div>
		</GameProvider>
	);
  };
	export default GameHeader;