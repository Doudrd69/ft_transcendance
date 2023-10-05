import './Game.css'
import React from 'react'
import GameMenuComponent from './gameMenu/GameMenu';
import MatchMakingComponent from './gameMenu/gameStart/GameStart'
import SettingsComponent from './gameMenu/gameSettings/gameSettings'
import {useGame } from './GameContext'
import Pong from './gamePong/GamePong';
const GameComponent: React.FC = () => {
	const { showGameMatchmaking, showGameSettings, showGameMenu} = useGame();
	
	return (
	  		<div className="right-half">
				{/* {showGameMatchmaking && <MatchMakingComponent/>}
				{showGameMenu && <GameMenuComponent/>}
				{showGameSettings && <SettingsComponent></SettingsComponent>} */}
				{/* <Pong></Pong> */}
	  		</div>
	);
  };
	export default GameComponent;