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
					// enlever userLogin, et userId, le gameMode pas besoin (si pas de gameMode peut etre faire un set joinQueue par defaut a NORMAL)
					gameSocket.emit('join-matchmaking', {gameMode: gameMode});
				});
			}
		});


		globalState.gameSocket?.on('setGameInvited', () => {
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
	}, [globalState?.gameSocket, globalState?.userSocket, gameMode])

	const handleStartClick = async () => {

		try {
				setGameMode("NORMAL");
				globalState.gameMode = "NORMAL";
				globalState.userSocket?.emit('checkAndSetUserInMatchmaking');

		} catch (error) {
			console.error(error);
		}
	};

	const handleSpeedClick = () => {

		try {
			setGameMode("SPEED");
			globalState.gameMode = "SPEED";
			globalState.userSocket?.emit('checkAndSetUserInMatchmaking');

		} catch (error) {
			console.error(error);
		}

	};

	useEffect(() => {
		globalState.userSocket?.emit('refreshUserList');
	}, []);

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