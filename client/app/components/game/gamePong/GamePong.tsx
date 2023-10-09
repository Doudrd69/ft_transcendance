import './GamePong.css';
import React, { useState, useEffect } from 'react';

const Pong: React.FC = () => {

    const [ballX, setBallX] = useState<number>(50);
    const [ballY, setBallY] = useState<number>(50);
    const [ballSpeedX, setBallSpeedX] = useState<number>(0.5);
    const [ballSpeedY, setBallSpeedY] = useState<number>(0.5);
    const [paddleY, setPaddleY] = useState<number>(50);
    const [paddleY1, setPaddleY1] = useState<number>(50);
    const paddleSpeed = 2;

    const [scorePlayer1, setScorePlayer1] = useState<number>(0);
    const [scorePlayer2, setScorePlayer2] = useState<number>(0);
    const [isKeyDownPressed, setIsKeyDownPressed] = useState<boolean>(false);
    const [isKeyUpPressed, setIsKeyUpPressed] = useState<boolean>(false);
    const [isSKeyPressed, setIsSKeyPressed] = useState<boolean>(false);
    const [isWKeyPressed, setIsWKeyPressed] = useState<boolean>(false);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            setIsKeyUpPressed(true);
        } else if (e.key === 'ArrowDown') {
            setIsKeyDownPressed(true);
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

        const updateBallPosition = () => {
            setBallX((prevBallX) => prevBallX + ballSpeedX);
            setBallY((prevBallY) => prevBallY + ballSpeedY);

            if (ballX <= 26) {
                setBallX(50);
                setBallY(50);
                setScorePlayer2((prevScore) => prevScore + 1);
            }
            else if (ballX >= 98) {
                setBallX(50);
                setBallY(50);
                setScorePlayer1((prevScore) => prevScore + 1);
            }

            
            if (ballY <= 10) {
                setBallY(11); 
                setBallSpeedY((prevSpeedY) => -prevSpeedY);
            } else if (ballY >= 98) {
                setBallY(97);
                setBallSpeedY((prevSpeedY) => -prevSpeedY)
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
        };

        const gameLoop = setInterval(updateBallPosition, 16);

        return () => {
            clearInterval(gameLoop);
            window.removeEventListener('keydown', handleKeyDown); 
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('keyup', handleKeyW);
            window.removeEventListener('keydown', handleKeyS);
        };
    }, [ballX, ballY, ballSpeedX, ballSpeedY, paddleY, paddleY1, isSKeyPressed, isWKeyPressed]);

    return (
        <div className="pong-container" tabIndex={0}>
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
            <div className="paddle" style={{ top: `${paddleY}%`, left: '26%' }}></div>
            <div className="paddle" style={{ right: 0, top: `${paddleY1}%` }}></div>
        </div>
    );  
};

export default Pong;