import './GameStart.css'
import React from 'react';
import { useGame } from '../../GameContext';
import { Socket } from 'socket.io-client'
import { useGlobal } from '@/app/GlobalContext';

const MatchMaking = () => {

    const { state, dispatchGame } = useGame();
    const { globalState } = useGlobal();

	const handleStartClick = async () => {
		const currentUserLogin = sessionStorage.getItem("currentUserLogin");
	
		if (globalState.gameSocket?.connected) {
			console.log("joueur leave")
			globalState.gameSocket?.emit('leave-matchmaking', currentUserLogin);
			globalState.gameSocket?.off('message');
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
                    <button className={`cancel-button ${state.showGameMenu ? 'clicked' : ''}`} onClick={() =>{ handleStartClick(); dispatchGame({ type: 'TOGGLE', payload: 'showGameMenu'})}}>Cancel</button>
        </div>
    );
};
export default MatchMaking