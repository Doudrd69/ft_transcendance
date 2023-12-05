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
	
	// const joinMatchmaking = (player) => {
	// 	fetch('http://localhost:3000/game/join', {
	// 	  method: 'POST',
	// 	  headers: {
	// 		'Content-Type': 'application/json',
	// 	  },
	// 	  body: JSON.stringify(player),
	// 	})
	// 	  .then((response) => {
	// 		if (!response.ok) {
	// 		  throw new Error('Erreur lors de la requête');
	// 		}
	// 		return response.json();
	// 	  })
	// 	  .then((data) => {
	// 		// Gérer la réponse du serveur (data)
	// 	  })
	// 	  .catch((error) => {
	// 		// Gérer les erreurs
	// 	  });
	//   };

	return (
	  		<div className="right-half">
				{showGameMatchmaking && <MatchMakingComponent/>}
				{showGameMenu && <GameMenuComponent/>}
				{showGameSettings && <SettingsComponent></SettingsComponent>}
				{showSettingsDisplay && <SettingsDisplay></SettingsDisplay>}
				{showSettingsGame && <SettingsGame></SettingsGame>}
				{showSettingsKeyboard && <SettingsKeyboard></SettingsKeyboard>}
				{/* <Pong></Pong> */}
	  		</div>
	);
  };
	export default GameComponent;