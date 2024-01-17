import './GamePong.css';
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../GameContext'
import { Socket } from 'socket.io-client'

const PongComponent = (socket: { socket: Socket }) => {

    const { state, dispatch } = useGame();
    const gameSocket = socket.socket;

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

    interface gameBallState {
        BallPosition: { x: number, y: number } | null,
        scoreOne: number,
        scoreTwo: number
    }

    interface gamePaddleState {
        paddleOne: { x: number, y: number } | null,
        paddleTwo: { x: number, y: number } | null,
    }

    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [containerHeight, setContainerHeight] = useState<number>(0);

    useEffect(() => {
        const pongContainer = document.querySelector('.pong-container');
        if (pongContainer) {
            const handleResize = () => {
                setContainerWidth(pongContainer.clientWidth);
                setContainerHeight(pongContainer.clientHeight);
                console.log(`pongcontainer size, x:${pongContainer.clientWidth}, y: ${pongContainer.clientHeight}`);
            };
            // Mettez à jour les dimensions du conteneur lorsqu'il est redimensionné
            window.addEventListener('resize', handleResize);

            handleResize();
            // Initialisez les dimensions du conteneur au chargement initial
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [blurGame]);

    const defaultGamePaddleState: gamePaddleState = {
        paddleOne: { x: 0, y: 0.5 * containerHeight },
        paddleTwo: { x: 0.9 * containerWidth, y: 0.5 * containerHeight },
    };

    const defaultGameBallState: gameBallState = {
        BallPosition: { x: 0.5 * containerWidth, y: 0.5 * containerHeight },
        scoreOne: 0,
        scoreTwo: 0,
    };

    const [gameBallState, setGameBallState] = useState<gameBallState>(defaultGameBallState);
    const [gamePaddleState, setGamePaddleState] = useState<gamePaddleState>(defaultGamePaddleState);


    interface Game {
        gameId: number;
        playerOneID: string;
        playerTwoID: string;
        playerOneLogin: string,
        playerTwoLogin: string,
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

    const [Game, setGame] = useState<Game>(defaultGame);


    useEffect(() => {
        const startCountdown = () => {
            setInCountdown(true);
            const countdownInterval = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);

            setTimeout(() => {
                clearInterval(countdownInterval);
                setCountdown(0); // Disappear the countdown div after 3 seconds
                setBlurGame(false); // Remove the blur effect after the countdown
            }, 3000);
        };

        setBlurGame(true); // Apply the blur effect initially
        startCountdown();
    }, []);

    useEffect(() => {

        gameSocket.on('Game_Start', (Game: Game) => {
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

        const gameLoop = setInterval(() => {
            if (!blurGame) {
                console.log(`BALL`);
                gameSocket.emit('GameBackUpdate', { gameID: gameID});
            }
        }, 16);

        gameSocket.on('GamePaddleUpdate', (gamePaddleState: gamePaddleState) => {
            const newGamePaddleState: gamePaddleState = {
                paddleOne: { x: gamePaddleState.paddleOne!.x * containerWidth, y: gamePaddleState.paddleOne!.y * containerHeight },
                paddleTwo: { x: gamePaddleState.paddleTwo!.x * containerWidth, y: gamePaddleState.paddleTwo!.y * containerHeight },
            }
            setGamePaddleState(newGamePaddleState);
        });

        gameSocket.on('GameBallUpdate', (gameBallState: gameBallState) => {
            const newGameBallState: gameBallState = {
                BallPosition: { x: gameBallState.BallPosition!.x * containerWidth || 153, y: gameBallState.BallPosition!.y * containerHeight || 50 },
                scoreOne: gameBallState.scoreOne,
                scoreTwo: gameBallState.scoreTwo,
            }
            setGameBallState(newGameBallState);
        });

        let inputLoop: NodeJS.Timeout;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (keyState.ArrowDown.down !== true && keyState.ArrowUp.down !== true) {
                inputLoop = setInterval(() => {
                    if (e.key === 'ArrowUp') {
                        keyState.ArrowUp.down = true;
                        gameSocket.emit('Game_Input', { input: "ArrowUp", gameID: gameID });

                    } else if (e.key === 'ArrowDown') {
                        keyState.ArrowUp.down = true;
                        gameSocket.emit('Game_Input', { input: "ArrowDown", gameID: gameID });
                    }
                }, 16);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                if (keyState.ArrowUp.down === true) {
                    clearInterval(inputLoop);
                    keyState.ArrowUp.down = false
                }
            }
            else if (e.key === 'ArrowDown') {
                if (keyState.ArrowDown.down === true) {
                    clearInterval(inputLoop);
                    keyState.ArrowDown.down = false
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            gameSocket.off('GameBallUpdate');
            gameSocket.off('GamePaddleUpdate');
            gameSocket.off('Game_Start');
            clearInterval(gameLoop);
            clearInterval(inputLoop);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameID, gameSocket, containerWidth, containerHeight, inCountdown]);


    return (
        <div className={`pong-container ${blurGame ? 'game-blur' : ''}`} tabIndex={0}>
            {countdown > 0 && (
                <div className="countdown-container" style={{ filter: 'none' }}>{countdown}</div>
            )}
            <div className="scoreboard">
                <div className="col-heading">
                    <h1>{Game.playerOneLogin}</h1>
                    <div className="col-display" id={Game.playerOneLogin}>{gameBallState.scoreOne}</div>
                </div>
                <div className="col-heading">
                    <h1>{Game.playerTwoLogin}</h1>
                    <div className="col-display" id={Game.playerTwoLogin}>{gameBallState.scoreTwo}</div>
                </div>
            </div>
            <div className="ball" style={{ left: `${gameBallState!.BallPosition!.x}px`, top: `${gameBallState!.BallPosition!.y}px` }}></div>
            <div className="pongpaddle" style={{ top: `${gamePaddleState!.paddleOne!.y}px`, left: `${gamePaddleState!.paddleOne!.x}px` }}></div>
            <div className="pongpaddle" style={{ left: `${gamePaddleState!.paddleTwo!.x}px`, top: `${gamePaddleState!.paddleTwo!.y}px` }}></div>
        </div>
    );
};

export default PongComponent;