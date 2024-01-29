import './GamePong.css';
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../GameContext'
import { Socket } from 'socket.io-client'
import { useGlobal } from '@/app/GlobalContext';
import ConfirmationComponent from '../../chat/bodyChat/chatFriendsList/confirmation/Confirmation';
import { useChat } from '../../chat/ChatContext';
// import { clearInterval } from 'timers';

const PongComponent = () => {

    const { state, dispatchGame } = useGame();
    const { globalState } = useGlobal();
    const { chatState, chatDispatch } = useChat();

    const [countdown, setCountdown] = useState<number>(3);
    const [blurGame, setBlurGame] = useState<boolean>(true);

    const [inCountdown, setInCountdown] = useState<boolean>(true);
    const [gameID, setGameID] = useState<number | null>(null);
    const [inputState, setInputState] = useState<inputState>({ up: false, down: false });
    const [keyState, setkeyState] = useState<keyState>({ ArrowUp: inputState, ArrowDown: inputState });

    interface inputState {
        up: boolean,
        down: boolean
    }

    interface keyState {
        ArrowUp: inputState,
        ArrowDown: inputState
    }


    interface gameState {
        BallPosition: { x: number, y: number } | null,
        scoreOne: number,
        scoreTwo: number,
        paddleOne: { x: number, y: number, width: number, height: number } | null,
        paddleTwo: { x: number, y: number, width: number, height: number } | null,
    }

    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [containerHeight, setContainerHeight] = useState<number>(0);

    let countdownInterval: NodeJS.Timeout;

	useEffect(() => {
		const pongContainer = document.querySelector('.pong-container');
		
		if (pongContainer) {
			const handleResize = () => {
				setContainerWidth(pongContainer.clientWidth);
				setContainerHeight(pongContainer.clientHeight);
				const newGameState = {
					BallPosition: { x: gameState.BallPosition!.x * containerWidth || containerWidth / 2, y: gameState.BallPosition!.y * containerHeight || containerHeight / 2 },
					scoreOne: gameState.scoreOne,
					scoreTwo: gameState.scoreTwo,
					paddleOne: { x: gameState.paddleOne!.x * containerWidth, y: gameState.paddleOne!.y * containerHeight, width: containerWidth * 0.025, height: containerHeight * 0.17 },
					paddleTwo: { x: gameState.paddleTwo!.x * containerWidth, y: gameState.paddleTwo!.y * containerHeight, width: containerWidth * 0.025, height: containerHeight * 0.17 },
				};
				setGameState(newGameState);
				console.log(`pongcontainer size, x:${pongContainer.clientWidth}, y: ${pongContainer.clientHeight}`);
			};
			
			window.addEventListener('resize', handleResize);
			handleResize();
			
			return () => {
				window.removeEventListener('resize', handleResize);
			};
		}
	}, [blurGame]);
	

    const defaultGameState: gameState = {
        BallPosition: { x: 0.5 * containerWidth, y: 0.5 * containerHeight },
        scoreOne: 0,
        scoreTwo: 0,
        paddleOne: { x: 0, y: 0.5 * containerHeight, width: containerWidth * 0.025, height: containerHeight * 0.17 },
        paddleTwo: { x: (1 - 0.025) * containerWidth, y: 0.5 * containerHeight, width: containerWidth * 0.025, height: containerHeight * 0.17 },
    };

    const [gameState, setGameState] = useState<gameState>(defaultGameState);


    interface Game {
        gameId: number;
        playerOneID: string;
        playerTwoID: string;
        playerOneLogin: string,
        playerTwoLogin: string,
        scoreOne: number;
        scoreTwo: number;
        pause: boolean;
    }

    const defaultGame: Game = {
        gameId: 1234,
        playerOneID: "Mattheo",
        playerTwoID: "Edouard",
        playerOneLogin: "Mattheo",
        playerTwoLogin: "Edouard",
        scoreOne: 0,
        scoreTwo: 0,
        pause: true,
    };

    const [Game, setGame] = useState<Game>(defaultGame);
    const currentUserId = sessionStorage.getItem("currentUserId");


    useEffect(() => {
        const startCountdown = () => {
            setInCountdown(true);
            countdownInterval = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);

                clearInterval(countdownInterval);
                globalState.gameSocket?.on('startGameLoop', () => {
                setCountdown(0);
                setBlurGame(false);
                setGame((prevState) => ({
                    ...prevState,
                    pause: false,
                }));
            });
        };

        setBlurGame(true);
        startCountdown();
    }, []);

    useEffect(() => {

        globalState.gameSocket?.on('gameStart', (Game: Game) => {
            console.log("DISBALE THIS BLUR");
            chatDispatch({ type: 'DISABLE', payload: 'showConfirmation' })
            setGameID(Game.gameId);
            setGame((prevState) => ({
                ...prevState,
                gameId: Game.gameId,
                playerOneID: Game.playerOneID,
                playerTwoID: Game.playerTwoID,
                playerOneLogin: Game.playerOneLogin,
                playerTwoLogin: Game.playerTwoLogin,
                scoreOne: Game.scoreOne,
                scoreTwo: Game.scoreTwo,
            }));
        });

        globalState.gameSocket?.on('GameUpdate', (gameState: gameState) => {
            // console.log("DISBALE THIS BLUR");
            const newGameState: gameState = {
                BallPosition: { x: gameState.BallPosition!.x * containerWidth || 0.5 * containerWidth, y: gameState.BallPosition!.y * containerHeight || 0.5 * containerHeight  },
                scoreOne: gameState.scoreOne,
                scoreTwo: gameState.scoreTwo,
                paddleOne: { x: gameState.paddleOne!.x * containerWidth, y: gameState.paddleOne!.y * containerHeight, width: containerWidth * 0.025, height: containerHeight * 0.17 },
                paddleTwo: { x: gameState.paddleTwo!.x * containerWidth, y: gameState.paddleTwo!.y * containerHeight, width: containerWidth * 0.025, height: containerHeight * 0.17 },
            }
            setGameState(newGameState);
        });

        let inputLoop: NodeJS.Timeout;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (keyState.ArrowDown.down !== true && keyState.ArrowUp.down !== true) {
                    if (e.key === 'ArrowUp') {
                        keyState.ArrowUp.down = true;
                        if (Game.pause !== true) {
                            globalState.gameSocket?.emit('gameInputDown', { input: "ArrowUp", gameID: gameID });
                        }

                    } else if (e.key === 'ArrowDown') {
                        keyState.ArrowUp.down = true;
                        if (Game.pause !== true) {
                            globalState.gameSocket?.emit('gameInputDown', { input: "ArrowDown", gameID: gameID });
                        }
                    }
            }
        };

        globalState.gameSocket?.on('GameGoal', (gameState: gameState) => {
            // console.log("DISBALE THIS BLUR");
            const newGameState: gameState = {
                BallPosition: { x: gameState.BallPosition!.x * containerWidth || 0.5 * containerWidth, y: gameState.BallPosition!.y * containerHeight || 0.5 * containerHeight },
                scoreOne: gameState.scoreOne,
                scoreTwo: gameState.scoreTwo,
                paddleOne: { x: gameState.paddleOne!.x * containerWidth, y: gameState.paddleOne!.y * containerHeight, width: containerWidth * 0.025, height: containerHeight * 0.17 },
                paddleTwo: { x: gameState.paddleTwo!.x * containerWidth, y: gameState.paddleTwo!.y * containerHeight, width: containerWidth * 0.025, height: containerHeight * 0.17 },
            }
            setGameState(newGameState);
            setGame((prevState) => ({
                ...prevState,
                pause: true,
            }));
            setTimeout(() => {
                setGame((prevState) => ({
                    ...prevState,
                    pause: false,
                }));
            }, 3000);
        });
        
        globalState.gameSocket?.on('GameEnd', (game: Game) => {
            setGame((prevState) => ({
                ...prevState,
                pause: true,
            }));
            dispatchGame({
                type: 'TOGGLE',
                payload: 'showGameMenu',
            });
            state.showGameMenu = true;
            globalState.gameSocket?.disconnect();
        });

        globalState.gameSocket?.on('userDisconnected', () => {
            dispatchGame({
                type: 'TOGGLE',
                payload: 'showGameMenu',
            });
            setGame((prevState) => ({
                ...prevState,
                pause: true,
            }));
            state.showGameMenu = true;
            globalState.gameSocket?.disconnect();
        });

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                if (keyState.ArrowUp.down === true) {
                    keyState.ArrowUp.down = false
                    globalState.gameSocket?.emit('gameInputUp', { input: "ArrowUp", gameID: gameID });
                }
            }
            else if (e.key === 'ArrowDown') {
                if (keyState.ArrowDown.down === true) {
                    keyState.ArrowDown.down = false
                    globalState.gameSocket?.emit('gameInputUp', { input: "ArrowDown", gameID: gameID });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            globalState.gameSocket?.off('GameBallUpdate');
            globalState.gameSocket?.off('GamePaddleUpdate');
            globalState.gameSocket?.off('Game_Start');
            globalState.gameSocket?.off('userDisconnected');
            globalState.gameSocket?.off('GameEnd');
            clearInterval(countdownInterval);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [blurGame, gameID, globalState?.gameSocket, containerWidth, containerHeight, inCountdown]);


    return (
        <div className={`pong-container ${blurGame ? 'game-blur' : ''}`} tabIndex={0}>
            {countdown > 0 && (
                <div className="countdown-container" style={{ filter: 'none' }}>{countdown}</div>
            )}
            <div className="scoreboard">
                <div className="col-heading">
                    <h1>{Game.playerOneLogin}</h1>
                    <div className="col-display" id={Game.playerOneLogin}>{gameState.scoreOne}</div>
                </div>
                <div className="col-heading">
                    <h1>{Game.playerTwoLogin}</h1>
                    <div className="col-display" id={Game.playerTwoLogin}>{gameState.scoreTwo}</div>
                </div>
            </div>
            <div className="ball" style={{ left: `${gameState!.BallPosition!.x - 0.5 * 0.04 * containerWidth}px`, top: `${gameState!.BallPosition!.y - 0.5 * 0.04 * containerHeight}px`, width: 0.04 * containerWidth, height: 0.04 * containerHeight }}></div>
            <div className="pongpaddle" style={{ top: `${gameState!.paddleOne!.y}px`, left: `${gameState!.paddleOne!.x}px`, width: `${gameState!.paddleOne!.width}px`, height: `${gameState!.paddleOne!.height}px` }}></div>
            <div className="pongpaddle" style={{ left: `${gameState!.paddleTwo!.x}px`, top: `${gameState!.paddleTwo!.y}px`, width: `${gameState!.paddleTwo!.width}px`, height: `${gameState!.paddleTwo!.height}px` }}></div>
        </div>
    );
};

export default PongComponent;