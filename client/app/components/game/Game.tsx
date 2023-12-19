import './Game.css'
import React from 'react'
import GameMenuComponent from './gameMenu/GameMenu';
import MatchMakingComponent from './gameMenu/gameStart/GameStart'
import SettingsComponent from './gameMenu/gameSettings/gameSettings'
import {GameProvider, useGame } from './GameContext'
import Pong from './gamePong/GamePong';
import SettingsDisplay from './gameMenu/gameSettings/settingsDisplay/SettingsDisplay';
import SettingsGame from './gameMenu/gameSettings/settingsGame/SettingsGame';
import SettingsKeyboard from './gameMenu/gameSettings/settingsKeyboard/SettingsKeyboard';
import { Socket } from 'socket.io-client'

const GameComponent = (socket: {socket: Socket}) => {
	const { showGameMatchmaking, showGameSettings, showGameMenu, showSettingsDisplay, showSettingsGame, showSettingsKeyboard} = useGame();

	return (
	  		<div className="right-half">
				{showGameMatchmaking && <MatchMakingComponent socket={socket.socket}/>}
				{showGameMenu && <GameMenuComponent socket={socket.socket}/>}
				{showGameSettings && <SettingsComponent></SettingsComponent>}
				{showSettingsDisplay && <SettingsDisplay></SettingsDisplay>}
				{showSettingsGame && <SettingsGame></SettingsGame>}
				{showSettingsKeyboard && <SettingsKeyboard></SettingsKeyboard>}
				{/* <Pong></Pong> */}
	  		</div>
	);
  };
	export default GameComponent;