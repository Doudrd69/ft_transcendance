import './Game.css'
import React from 'react'
import GameMenu from './gameMenu/GameMenu';
import MatchMaking from './gameMenu/gameStart/GameStart'
import Settings from './gameMenu/gameSettings/gameSettings'

const GameComponent: React.FC = () => {
	return (
	  <div className="right-half">
		{/* <MatchMaking></MatchMaking> */}
		{/* <GameMenu></GameMenu> */}
		<Settings></Settings>
	  </div>
	);
  };
	export default GameComponent;