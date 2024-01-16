import './GameMenu.css'
import MatchMaking from './gameStart/GameStart'
import Settings from './gameSettings/gameSettings'
import { useGame } from '../GameContext'
import React, { useState } from 'react';
import { Socket } from 'socket.io-client'


const Menu = (socket: { socket: Socket }) => {

    const { state, dispatch } = useGame();

    const gameSocket = socket.socket;

    interface Game {
        gameId: number;
        playerOneID: string;
        playerTwoID: string;
        scoreOne: number;
        scoreTwo: number;
    }
        
    const handleStartClick = async () => {
        const currentUserID = sessionStorage.getItem("currentUserID");

        if (gameSocket.connected) {
            console.log("GameSocket connecté")
            // gameSocket.emit('linkSocketWithUser', sessionStorage.getItem("currentUserLogin"));
            gameSocket.emit('join-matchmaking', currentUserID);
            await gameSocket.on('joinGame', (game: Game) => {
                console.log("Join Game recieve !");
                console.log(`${game.playerOneID} enter in the Game`);
                console.log(`${game.playerTwoID} enter in the Game`);
                dispatch({
                    type: 'TOGGLE',
                    payload: 'showGame',
                });
                state.showGame = true;
            })
        }   
        else {
            console.log("GameSocket pas connecté");
        }

        return () => {
            gameSocket.off('joinGame');
        }
    };

    return (
        <div className="background-game">
            <div className="background-game">
                <h1 className='titleClass'>PONG GAME</h1>
            </div>
            <div className="background-game">
                <button className={`buttonclass ${state.showGameMatchmaking ? 'clicked' : ''}`} onClick={() => { handleStartClick(); dispatch({ type: 'TOGGLE', payload: 'showGameMatchmaking' }); }}>START GAME</button>
                <button className="buttonclass" >PROFILE</button>
                <button className={`buttonclass ${state.showGameSettings ? 'clicked' : ''}`} onClick={() => dispatch({ type: 'TOGGLE', payload: 'showGameSettings' })}>SETTINGS</button>
            </div>
        </div>
    );
};

export default Menu;

{/* <div className="paddle paddle-left">
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
            </div> */}