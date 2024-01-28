import './GameStart.css'
import React, { useEffect } from 'react';
import { useGame } from '../../GameContext';
import { Socket } from 'socket.io-client'
import { useGlobal } from '@/app/GlobalContext';

const MatchMaking = () => {

    const { state, dispatchGame } = useGame();
    const { globalState } = useGlobal();

	const handleLeave= () => {

		if (globalState.gameSocket?.connected) {
			console.log("Player leaves matchmaking")
			globalState.gameSocket?.emit('leave-matchmaking', { playerLogin: sessionStorage.getItem("currentUserLogin") });
		}
		else {
			console.log("ERROR: GameSocket pas connecté (leave matchmaking)");
		}
	};
	
    useEffect(() => {

        globalState.gameSocket?.on('leave-game', () => {
            console.log("Event leave-game");
            globalState.gameSocket?.disconnect();
            dispatchGame({ type: 'TOGGLE', payload: 'showGameMenu'});
            state.showGameMenu = true;
        });
            
        globalState.gameSocket?.on('setgame', () => {
            console.log("SET GAME");
            dispatchGame({
                type: 'TOGGLE',
                payload: 'showGame',
            });
            state.showGame = true;
        });
        globalState.gameSocket?.on('gameInProgress', () => {
            console.log(`DISPATCH_IP`);
            globalState.gameSocket?.disconnect();
            dispatchGame({ type: 'TOGGLE', payload: 'showGameMenu'});
            state.showGameMenu = true;
        });

        return () => {
            globalState.gameSocket?.off('leave-game');
            globalState.gameSocket?.off('setgame');
            globalState.gameSocket?.off('returnGameInProgress');
         }

    }, [globalState?.gameSocket]);

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
                    <button className={`cancel-button ${state.showGameMenu ? 'clicked' : ''}`} onClick={() => {
                        handleLeave();
                    }}>Cancel</button>
        </div>
    );
};
export default MatchMaking