import './GameStart.css'
import React from 'react';
import { useGame } from '../../GameContext';
import { Socket } from 'socket.io-client'

const MatchMaking = (socket: {socket: Socket}) => {

	const gameSocket = socket.socket;
    const { chatState, chatDispatch } = useGame();

	const handleStartClick = async () => {
		const currentUserLogin = sessionStorage.getItem("currentUserLogin");
	
		if (gameSocket.connected) {
			console.log("joueur leave")
			gameSocket.emit('leave-matchmaking', currentUserLogin);
			gameSocket.off('message');
		}
		else {
			console.log("GameSocket pas connecté");
		}
	};
	

    return (
        <div className="matchmakingClass">
            <div className="cs-loader">
                <div className="cs-loader-inner">
                    <label>●</label>
                    <label>●</label>
                    <label>●</label>
                    <label>●</label>
                    <label>●</label>
                    <label>●</label>
                </div>
            </div>
                    <button className={`cancel-button ${state.showGameMenu ? 'clicked' : ''}`} onClick={() =>{ handleStartClick(); dispatch({ type: 'TOGGLE', payload: 'showGameMenu'})}}>Cancel</button>
        </div>
    );
};
export default MatchMaking