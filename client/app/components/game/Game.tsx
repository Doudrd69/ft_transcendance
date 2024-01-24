import './Game.css'
import React from 'react'
import GameMenuComponent from './gameMenu/GameMenu';
import MatchMakingComponent from './gameMenu/gameStart/GameStart'
import SettingsComponent from './gameMenu/gameSettings/gameSettings'
import {GameProvider, useGame } from './GameContext'
import PongComponent from './gamePong/GamePong';
import SettingsDisplay from './gameMenu/gameSettings/settingsDisplay/SettingsDisplay';
import SettingsGame from './gameMenu/gameSettings/settingsGame/SettingsGame';
import SettingsKeyboard from './gameMenu/gameSettings/settingsKeyboard/SettingsKeyboard';

const GameComponent = () => {

	const { state } = useGame();

	const renderComponent = (component: React.ReactNode, condition: boolean) =>
	  condition ? component : null;

	return (
	  		<div className="right-half">
				{renderComponent(<MatchMakingComponent />, state.showGameMatchmaking)}
				{renderComponent(<GameMenuComponent/>, state.showGameMenu)}
				{renderComponent(<PongComponent />, state.showGame)}
	  		</div>
	);
  };
	export default GameComponent;