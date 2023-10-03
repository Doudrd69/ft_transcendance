import './Game.css'
import React from 'react'
import GameMenu from './gameMenu/GameMenu';
import MatchMaking from './gameStart/GameStart'

const GameComponent: React.FC = () => {
	return (
	  <div className="right-half">
		<MatchMaking></MatchMaking>
	  </div>
	);
  };
	export default GameComponent;