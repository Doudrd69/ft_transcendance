import './gamePong.css';
import React, { useState, useEffect } from 'react';

const Pong: React.FC = () => {

    const [ballX, setBallX] = useState<number>(50);
    const [ballY, setBallY] = useState<number>(50);
    const [ballSpeedX, setBallSpeedX] = useState<number>(0.5);
    const [ballSpeedY, setBallSpeedY] = useState<number>(0.5);
    const [paddleY, setPaddleY] = useState<number>(50);
    const [paddleY1, setPaddleY1] = useState<number>(50);
    const paddleSpeed = 2;

    const [isSKeyPressed, setIsSKeyPressed] = useState<boolean>(false);

    const [isWKeyPressed, setIsWKeyPressed] = useState<boolean>(false);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'w') {
            setIsWKeyPressed(true);
        } else if (e.key === 's') {
            setIsSKeyPressed(true);
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'w') {
            setIsWKeyPressed(false);
        } else if (e.key === 's') {
            setIsSKeyPressed(false);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const updateBallPosition = () => {
            setBallX((prevBallX) => prevBallX + ballSpeedX);
            setBallY((prevBallY) => prevBallY + ballSpeedY);

            if (ballX <= 0 || ballX >= 100) {
                setBallX(50);
                setBallY(50);
            }

            
            if (ballY <= 0) {
                setBallY(1); 
                setBallSpeedY((prevSpeedY) => -prevSpeedY);
            } else if (ballY >= 99) {
                setBallY(98);
                setBallSpeedY((prevSpeedY) => -prevSpeedY)
            }

            if (ballX <= 5 && ballY >= paddleY && ballY <= paddleY + 20 && ballSpeedX < 0) {
                setBallSpeedX((prevSpeedX) => -prevSpeedX); 
            }

            if (ballX >= 95 && ballY >= paddleY1 && ballY <= paddleY1 + 20 && ballSpeedX > 0) {
                setBallSpeedX((prevSpeedX) => -prevSpeedX); // Rebond sur le paddle droit
            }

            if (isSKeyPressed) {
                setPaddleY1((prevY) => Math.min(92, prevY + paddleSpeed)); // Empêcher de descendre hors écran
            }

            if (isWKeyPressed) {
                setPaddleY1((prevY) => Math.max(0, prevY - paddleSpeed));
            }
        };

        const gameLoop = setInterval(updateBallPosition, 16);

        return () => {
            clearInterval(gameLoop);
            window.removeEventListener('keydown', handleKeyDown); 
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [ballX, ballY, ballSpeedX, ballSpeedY, paddleY, paddleY1, isSKeyPressed, isWKeyPressed]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const mouseY = (e.clientY / window.innerHeight) * 92; 
        const minPaddleY = 0;
        const maxPaddleY = 92; 
        const clampedPaddleY = Math.min(maxPaddleY, Math.max(minPaddleY, mouseY));

        setPaddleY(clampedPaddleY);
    };

    return (
        <div className="pong-container" onMouseMove={handleMouseMove} tabIndex={0}>
            <div className="ball" style={{ left: `${ballX}%`, top: `${ballY}%` }}></div>
            <div className="paddle" style={{ top: `${paddleY}%` }}></div>
            <div className="paddle" style={{ right: 0, top: `${paddleY1}%` }}></div>
        </div>
    );
};

export default Pong;