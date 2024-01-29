import './GameMenu.css'
import MatchMaking from './gameStart/GameStart'
import Settings from './gameSettings/gameSettings'
import { useGame } from '../GameContext'
import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client'
import { useGlobal } from '@/app/GlobalContext';

const Menu = () => {

    const { state, dispatchGame } = useGame();
    const { globalState, dispatch } = useGlobal();
    const [gameMode, setGameMode] =  useState<string | null>(null);

    interface Game {
        gameId: number;
        playerOneLogin: string,
        playerTwoLogin: string,
        playerOneID: string;
        playerTwoID: string;
        scoreOne: number;
        scoreTwo: number;
    }

    const defaultGame: Game = {
        gameId: 1234,
        playerOneID: "Mattheo",
        playerTwoID: "Edouard",
        playerOneLogin: "Mattheo",
        playerTwoLogin: "Edouard",
        scoreOne: 0,
        scoreTwo: 0,
    };
    
    useEffect(() => {
        globalState.gameSocket?.on('gameNotInProgress', () => {
            console.log(`DISPATCH`);
            dispatchGame({ type: 'TOGGLE', payload: 'showGameMatchmaking'});
            globalState.gameSocket?.emit('join-matchmaking',{ playerLogin: sessionStorage.getItem("currentUserLogin"),  gameMode: gameMode});
        });

        globalState.gameSocket?.on('setgame', () => {
            console.log("SET GAME");
            dispatchGame({
                type: 'TOGGLE',
                payload: 'showGame',
            });
            state.showGame = true;
        });

    })

    const handleStartClick = () => {

        try {
            setGameMode("NORMAL");
            const gameSocket = io('http://localhost:3001/game', {
                autoConnect: false,
                auth: {
                    token: sessionStorage.getItem("jwt"),
                }
            });
            gameSocket.connect();

            dispatch({ type: 'SET_GAME_SOCKET', payload: gameSocket });
            // dispatchGame({ type: 'TOGGLE', payload: 'showGameMatchmaking' });
    
            // console.log("After Dispatch: ", globalState?.gameSocket);

        } catch (error) {
            console.error(error);
        }

        
    };

    const handleSpeedClick = () => {

        try {
            setGameMode("SPEED");
            const gameSocket = io('http://localhost:3001/game', {
                autoConnect: false,
                auth: {
                    token: sessionStorage.getItem("jwt"),
                }
            });
            gameSocket.connect();

            dispatch({ type: 'SET_GAME_SOCKET', payload: gameSocket });
            // dispatchGame({ type: 'TOGGLE', payload: 'showGameMatchmaking' });
    
            // console.log("After Dispatch: ", globalState?.gameSocket);

        } catch (error) {
            console.error(error);
        }
        
    };

    return (
        <div className="background-game">
            <div className="background-game">
                <h1 className='titleClass'>PONG GAME</h1>
            </div>
            <div className="background-game">
                <button className={`buttonclass ${state.showGameMatchmaking ? 'clicked' : ''}`} onClick={() => { 
                    handleStartClick(); 
                    }}>START GAME: NORMAL MODE</button>
                    <button className={`buttonclass ${state.showGameMatchmaking ? 'clicked' : ''}`} onClick={() => { 
                    handleSpeedClick(); 
                    }}>START GAME: SPEED MODE</button>
                {/* <button className="buttonclass" >PROFILE</button> */}
                {/* <button className={`buttonclass ${state.showGameSettings ? 'clicked' : ''}`} onClick={() => dispatch({ type: 'TOGGLE', payload: 'showGameSettings' })}>SETTINGS</button> */}
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