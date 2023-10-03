import './GameMenu.css'
import React from 'react';

const Menu: React.FC = () => {
    return (
      <div className="background-game">
         <h1 className='titleClass'>PONG GAME</h1>
         <button className='buttonclass'>START GAME</button>
         <button className='buttonclass'>STATS</button>
         <button className='buttonclass'>SETTINGS</button>

      </div>
    );
  };
  export default Menu