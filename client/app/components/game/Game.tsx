import './Game.css'
import React from 'react'
import GameMenuComponent from './gameMenu/GameMenu';
import MatchMakingComponent from './gameMenu/gameStart/GameStart'
import SettingsComponent from './gameMenu/gameSettings/gameSettings'
import {useGame } from './GameContext'
import Pong from './gamePong/GamePong';
import SettingsDisplay from './gameMenu/gameSettings/settingsDisplay/SettingsDisplay';
import SettingsGame from './gameMenu/gameSettings/settingsGame/SettingsGame';
import SettingsKeyboard from './gameMenu/gameSettings/settingsKeyboard/SettingsKeyboard';

const GameComponent: React.FC = () => {
	const { showGameMatchmaking, showGameSettings, showGameMenu, showSettingsDisplay, showSettingsGame, showSettingsKeyboard} = useGame();
	
	return (
	  		<div className="right-half">
				{/* {showGameMatchmaking && <MatchMakingComponent/>}
				{showGameMenu && <GameMenuComponent/>}
				{showGameSettings && <SettingsComponent></SettingsComponent>}
				{showSettingsDisplay && <SettingsDisplay></SettingsDisplay>}
				{showSettingsGame && <SettingsGame></SettingsGame>}
				{showSettingsKeyboard && <SettingsKeyboard></SettingsKeyboard>} */}
				<Pong></Pong>
	  		</div>
	);
  };
	export default GameComponent;