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
    const [gameState, setGameState] = useState<gameState>();

    interface ball {
        x: number,
        y: number,
        r: number
    }

    interface gameState {
        BallPosition: ball[] | null,
        paddleOne: { x: number, y: number } | null,
        paddleTwo: { x: number, y: number } | null
    }

    interface inputState {
        up: boolean,
        down: boolean
    }

    interface Game {
        gameId: number;
        playerOneID: string;
        playerTwoID: string;
        scoreOne: number;
        scoreTwo: number;
    }


    useEffect(() => {
        gameSocket.on('Game_Start', (Game: Game) => {

        })

        gameSocket.on('Game_Update', (gameState: gameState) => {
            setGameState((prevState) => ({
                ...prevState,
                BallPosition: gameState.BallPosition!.map((ball) => ({
                    x: ball.x / (16 / 9),
                    y: ball.y,
                    r: ball.r
                })),
                paddleOne: { x: gameState.paddleOne!.x / (16 / 9), y: gameState.paddleOne!.y },
                paddleTwo: { x: gameState.paddleTwo!.x / (16 / 9), y: gameState.paddleTwo!.y }
            }));
        })
    });

    const updateBallPosition = () => { //a changer pour le back
        if (!blurGame) {
            setBallX((prevBallX) => prevBallX + ballSpeedX + ballSpeed);
            setBallY((prevBallY) => prevBallY + ballSpeedY + ballSpeed);

            if (ballX <= 26) {
                setBallX(50);
                setBallY(50);
                setScorePlayer2((prevScore) => prevScore + 1);
                setBallSpeedX((prevSpeedX) => -prevSpeedX);
            }
            else if (ballX >= 98) {
                setBallX(50);
                setBallY(50);
                setScorePlayer1((prevScore) => prevScore + 1);
                setBallSpeedX((prevSpeedX) => -prevSpeedX);
            }

            if (ballY <= 10) {
                setBallY(11);
                setBallSpeedY((prevSpeedY) => -prevSpeedY);
            }
            else if (ballY >= 97) {
                setBallY(96);
                setBallSpeedY((prevSpeedY) => -prevSpeedY);
            }

            if (ballX <= 29 && ballY >= paddleY && ballY <= paddleY + 20 && ballSpeedX < 0) {
                setBallSpeedX((prevSpeedX) => -prevSpeedX);
            }
            if (ballX >= 95 && ballY >= paddleY1 && ballY <= paddleY1 + 20 && ballSpeedX > 0) {
                setBallSpeedX((prevSpeedX) => -prevSpeedX);
            }

            if (isSKeyPressed) {
                setPaddleY((prevY) => Math.min(90, prevY + paddleSpeed)); // Empêcher de descendre hors écran
            }

            if (isWKeyPressed) {
                setPaddleY((prevY) => Math.max(10, prevY - paddleSpeed));
            }

            if (isKeyDownPressed) {
                setPaddleY1((prevY) => Math.min(90, prevY + paddleSpeed)); // Déplacer vers le bas
            }

            if (isKeyUpPressed) {
                setPaddleY1((prevY) => Math.max(10, prevY - paddleSpeed)); // Déplacer vers le haut
            }
        }
    }

    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        gameLoopRef.current = setInterval(() => {
            if (!blurGame) {
                updateBallPosition();
            }
        }, 16);

        return () => {
            clearInterval(gameLoopRef.current!); // Use the interval ID from the ref
        };
    }, [blurGame]);

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

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            setIsKeyUpPressed(true);
            gameSocket.emit('Game_Input', { input: "ArrowUp" });
        } else if (e.key === 'ArrowDown') {
            gameSocket.emit('Game_Input', { input: "ArrowDown" });
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            setIsKeyUpPressed(false);
        } else if (e.key === 'ArrowDown') {
            setIsKeyDownPressed(false);
        }
    };

    const handleKeyS = (e: KeyboardEvent) => {
        if (e.key === 'w') {
            setIsWKeyPressed(true);
            // gameSocket.emit()
        } else if (e.key === 's') {
            setIsSKeyPressed(true);
        }
    };

    const handleKeyW = (e: KeyboardEvent) => {
        if (e.key === 'w') {
            setIsWKeyPressed(false);
        } else if (e.key === 's') {
            setIsSKeyPressed(false);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('keyup', handleKeyW);
        window.addEventListener('keydown', handleKeyS);

        const gameLoop = setInterval(updateBallPosition, 16);


        return () => {
            clearInterval(gameLoop);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('keyup', handleKeyW);
            window.removeEventListener('keydown', handleKeyS);
        };
    }, [ballX, ballY, ballSpeedX, ballSpeedY, ballSpeed, paddleY, paddleY1, isSKeyPressed, isWKeyPressed]);

    return (
        <div className={`pong-container ${blurGame ? 'game-blur' : ''}`} tabIndex={0}>
            {countdown > 0 && (
                <div className="countdown-container">{countdown}</div>
            )}
            <div className="scoreboard">
                <div className="col-heading">
                    <h1>Player 1</h1>
                    <div className="col-display" id="scoreHome">{scorePlayer1}</div>
                </div>
                <div className="col-heading">
                    <h1>Player 2</h1>
                    <div className="col-display" id="scoreGuest">{scorePlayer2}</div>
                </div>
            </div>
            <div className="ball" style={{ left: `${ballX}%`, top: `${ballY}%` }}></div>
            <div className="pongpaddle" style={{ top: `${paddleY}%`, left: '26%' }}></div>
            <div className="pongpaddle" style={{ right: 0, top: `${paddleY1}%` }}></div>
        </div>
    );
};

export default PongComponent;