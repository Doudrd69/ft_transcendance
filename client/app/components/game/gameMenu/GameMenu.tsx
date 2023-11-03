import './GameMenu.css'
import React from 'react';
import MatchMaking from './gameStart/GameStart'
import Settings from './gameSettings/gameSettings'
import {useGame } from '../GameContext'


const Menu: React.FC = () => {

  const {showGameMatchmaking, showGameSettings, handleGameSettings, handleGameMatchmaking} = useGame();
  
  const handleStartClick = () => {
    // Créez ici les données du joueur que vous souhaitez envoyer
    const player = {
      name: "TestUser",
      // Ajoutez d'autres propriétés du joueur ici
    };

    // Utilisez fetch pour envoyer le joueur au matchmaking
    fetch('http://localhost:3000/game/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(player),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erreur lors de la requête');
        }
        return response.json();
      })
      .then((data) => {
        // Gérer la réponse du serveur (data) ici
        console.log('Réponse du serveur :', data);
        // Si le joueur est ajouté à la file d'attente, vous pouvez mettre à jour l'interface utilisateur ou effectuer d'autres actions.
      })
      .catch((error) => {
        // Gérer les erreurs ici
        console.error('Erreur :', error);
      });
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
        <button className={`buttonclass ${showGameMatchmaking ? 'clicked' : ''}`} onClick={handleStartClick} onClick={handleGameMatchmaking}>START GAME</button>
        <button className={`buttonclass ${showGameSettings ? 'clicked' : ''}`} onClick={handleGameSettings}>PROFILE</button>
        <button className={`buttonclass ${showGameSettings ? 'clicked' : ''}`} onClick={handleGameSettings}>SETTINGS</button>
      </div>
    </div>
  );
};

export default Menu;