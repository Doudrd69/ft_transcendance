import './GameMenu.css'
import MatchMaking from './gameStart/GameStart'
import Settings from './gameSettings/gameSettings'
import { useGame } from '../GameContext'
import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client'
import { useGlobal } from '@/app/GlobalContext';
import { stringify } from 'querystring';
import { start } from 'repl';

const Menu = () => {

	const { state, dispatchGame } = useGame();
	const { globalState, dispatch } = useGlobal();
	const [gameMode, setGameMode] = useState<string | null>(null);
	const [startGame, setStartGame] = useState(false);

	interface Game {
		gameId: number;
		playerOneLogin: string,
		playerTwoLogin: string,
		playerOneID: string;
		playerTwoID: string;
		scoreOne: number;
		scoreTwo: number;
	}

	useEffect(() => {

		globalState.userSocket?.on('gameNotInProgress', () => {
			if (!globalState.gameSocket?.connected) {
				console.log(`[gameNotInProgress] : ${sessionStorage.getItem("currentUserLogin")}`)
				const gameSocket = io(`${process.env.API_URL}/game`, {
					autoConnect: false,
					auth: {
						token: sessionStorage.getItem("jwt"),
					}
				});
				gameSocket.connect();
				dispatch({ type: 'SET_GAME_SOCKET', payload: gameSocket });
				gameSocket.on('connect', () => {
					dispatchGame({ type: 'TOGGLE', payload: 'showGameMatchmaking' });
					gameSocket.emit('join-matchmaking', { playerLogin: sessionStorage.getItem("currentUserLogin"), gameMode: globalState.gameMode, userId: Number(sessionStorage.getItem("currentUserID")) });
				});
			}
		});


		globalState.gameSocket?.on('setGameInvited', () => {
			console.log("SET GAME");
			dispatchGame({
				type: 'TOGGLE',
				payload: 'showGame',
			});
			state.showGame = true;
		});

		return () => {
			globalState.userSocket?.off('gameNotInProgress');
			globalState.gameSocket?.off('setGameInvited');
		}
	}, [globalState?.gameSocket, globalState?.userSocket])

	const handleStartClick = async () => {

		try {
				globalState.gameMode = "NORMAL";
				globalState.userSocket?.emit('checkAndSetUserInMatchmaking', { userId: sessionStorage.getItem("currentUserID")});

		} catch (error) {
			console.error(error);
		}
	};

	//     GameGtw client connected : cQ264ZpyzQgo2rlAAAAF
// server         | == wmonacho, userID= 1 JOINS MATCHMAKING ==
// server         | gameMode ==== NORMAL
// server         | Search for userID  1
// server         | Search for playerID  cQ264ZpyzQgo2rlAAAAF
// server         | User game : false
// server         | joinSpeedQueue: 
// server         | joinNormalQueue: cQ264ZpyzQgo2rlAAAAF
// server         | Ready to start:  false
// server         | emit leave-matchmaking : cQ264ZpyzQgo2rlAAAAF
// server         | quitSpeedQueue: 
// server         | quitNormalQueue: 
// server         | [handleDisconnect] ONE DISCONNECT
// server         | [handleDisconnect] User 1 retrieved by socketId
// server         | [handleDisconnect] Retrieved disconnected user : wmonacho
// server         | user ingame : false, user inmatchmaking: false
// server         | [cQ264ZpyzQgo2rlAAAAF] GameGtw client disconnected : cQ264ZpyzQgo2rlAAAAF




	const handleSpeedClick = () => {

		try {
			dispatchGame({ type: 'TOGGLE', payload: 'showGameMatchmaking' });
			globalState.gameMode = "SPEED";
			const gameSocket = io(`${process.env.API_URL}/game`, {
				autoConnect: false,
				auth: {
					token: sessionStorage.getItem("jwt"),
				}
			});
			gameSocket.connect();
			gameSocket.on('connect', () => {
				dispatch({ type: 'SET_GAME_SOCKET', payload: gameSocket });
				gameSocket.emit('linkSocketWithUser', { playerLogin: sessionStorage.getItem("currentUserLogin"), userId: sessionStorage.getItem("currentUserID") });
			});

		} catch (error) {
			console.error(error);
		}

	};

	return (
		<div className="slider-thumb">
			{/* <div className="background-game"> */}
			<h1 className='titleClass'>PINGPON GAME</h1>
			{!startGame ?
				<button className={`buttonclass ${state.showGameMatchmaking ? 'clicked' : ''}`} onClick={() => {
					setStartGame(true);
				}}>PLAY A GAME</button>
				:
				<>
					<button className={`buttonclass ${state.showGameMatchmaking ? 'clicked' : ''}`} onClick={() => {
						handleStartClick();
					}}>START GAME: NORMAL MODE</button>
					<button className={`buttonclass ${state.showGameMatchmaking ? 'clicked' : ''}`} onClick={() => {
						handleSpeedClick();
					}}>START GAME: SPEED MODE</button>
				</>
			}
			{/* </div> */}
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