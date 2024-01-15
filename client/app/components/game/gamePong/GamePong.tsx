import './GamePong.css';
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../GameContext'
import { Socket } from 'socket.io-client'

const PongComponent = (socket: { socket: Socket }) => {

    const { state, dispatch } = useGame();
    const gameSocket = socket.socket;

    const [countdown, setCountdown] = useState<number>(3);
    const [blurGame, setBlurGame] = useState<boolean>(true);
    const [ballX, setBallX] = useState<number>(50);
    const [ballY, setBallY] = useState<number>(50);
    const [ballSpeedX, setBallSpeedX] = useState<number>(0.5);
    const [ballSpeedY, setBallSpeedY] = useState<number>(0.5);
    const [paddleY, setPaddleY] = useState<number>(50);
    const [paddleY1, setPaddleY1] = useState<number>(50);
    const paddleSpeed = 2;
    const [ballSpeed, setBallSpeed] = useState<number>(0.0);

    const [scorePlayer1, setScorePlayer1] = useState<number>(0);
    const [scorePlayer2, setScorePlayer2] = useState<number>(0);
    const [isKeyDownPressed, setIsKeyDownPressed] = useState<boolean>(false);
    const [isKeyUpPressed, setIsKeyUpPressed] = useState<boolean>(false);
    const [isSKeyPressed, setIsSKeyPressed] = useState<boolean>(false);
    const [isWKeyPressed, setIsWKeyPressed] = useState<boolean>(false);

    const [inCountdown, setInCountdown] = useState<boolean>(true);
    const [gameID, setGameID] = useState<number | null>(null);
    const [inputState, setInputState] = useState<inputState>({ up: false, down: false });


    interface inputState {
        up: boolean,
        down: boolean
    }

    const keyState = {
        ArrowUp: false,
        ArrowDown: false,
        W: false,
        S: false,
    };

    interface gameBallState {
        BallPosition: { x: number, y: number } | null,
        scoreOne: number,
        scoreTwo: number
    }

    interface gamePaddleState {
        paddleOne: { x: number, y: number } | null,
        paddleTwo: { x: number, y: number } | null,
    }


    const defaultGamePaddleState: gamePaddleState = {
        paddleOne: { x: 0, y: 50 },
        paddleTwo: { x: 306, y: 50 },
    };

    const defaultGameBallState: gameBallState = {
        BallPosition: { x: 153, y: 50 },
        scoreOne: 0,
        scoreTwo: 0,
    };

    const [gameBallState, setGameBallState] = useState<gameBallState>(defaultGameBallState);

    const [gamePaddleState, setGamePaddleState] = useState<gamePaddleState>(defaultGamePaddleState);

    interface inputState {
        up: boolean,
        down: boolean
    }

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
                scoreOne: Game.scoreOne,
                scoreTwo: Game.scoreTwo,
            }));
        });

        const gameLoop = setInterval(() => {
            if (!blurGame) {
                gameSocket.emit('GameBackUpdate', { gameID: gameID });
            }
        }, 16);

        return () => {
            gameSocket.off('Game_Start');
            clearInterval(gameLoop);
        };
    }, [blurGame, gameID, gameSocket]);

    useEffect(() => {

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                if (inputState.up === false) {
                    console.log()
                    gameSocket.emit('Game_Input', { input: "ArrowUp", gameID: gameID });
                }
                setInputState((prevState) => ({
                    ...prevState,
                    up: true
                }));
            } else if (e.key === 'ArrowDown') {
                if (inputState.down === false) {
                    gameSocket.emit('Game_Input', { input: "ArrowDown", gameID: gameID });
                }
                setInputState((prevState) => ({
                    ...prevState,
                    down: true
                }));
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                if (inputState.up === true) {
                    gameSocket.emit('Game_Input', { input: "ArrowUp", gameID: gameID });
                }
                setInputState((prevState) => ({
                    ...prevState,
                    up: false
                }));
            } else if (e.key === 'ArrowDown') {
                if (inputState.down === true) {
                    gameSocket.emit('Game_Input', { input: "ArrowDown", gameID: gameID });
                }
                setInputState((prevState) => ({
                    ...prevState,
                    down: false
                }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);


        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    });

    useEffect(() => {

        gameSocket.on('GamePaddleUpdate', (gamePaddleState: gamePaddleState) => {
            const newGamePaddleState: gamePaddleState = {
                paddleOne: { x: gamePaddleState.paddleOne!.x / (16 / 9), y: gamePaddleState.paddleOne!.y },
                paddleTwo: { x: gamePaddleState.paddleTwo!.x / (16 / 9), y: gamePaddleState.paddleTwo!.y },
            }
            setGamePaddleState(newGamePaddleState);
        });

        gameSocket.on('GameBallUpdate', (gameBallState: gameBallState) => {
            console.log(`New BallPosition: ${gameBallState.BallPosition!.x}`);
            const newGameBallState: gameBallState = {
                BallPosition: { x: gameBallState.BallPosition!.x / (16 / 9) || 153, y: gameBallState.BallPosition!.y || 50 },
                scoreOne: gameBallState.scoreOne,
                scoreTwo: gameBallState.scoreTwo,
            }
            setGameBallState(newGameBallState);
        });

        return () => {
            gameSocket.off('GameBallUpdate');
            gameSocket.off('GamePaddleUpdate');
        };
    }, [gameSocket]);


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
            <div className="ball" style={{ left: `${gameBallState!.BallPosition!.x}%`, top: `${gameBallState!.BallPosition!.y}%` }}></div>
            <div className="pongpaddle" style={{ top: `${gamePaddleState!.paddleOne!.y}%`, left: `${gamePaddleState!.paddleOne!.x}%` }}></div>
            <div className="pongpaddle" style={{ left: `${gamePaddleState!.paddleTwo!.x}%`, top: `${gamePaddleState!.paddleTwo!.y}%` }}></div>
        </div>
    );
};

export default PongComponent;