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
			globalState.gameSocket?.emit('leaveMatchmaking');
		}
	};
  
	useEffect(() => {
		globalState.gameSocket?.on('leave-game', () => {
			dispatchGame({ type: 'TOGGLE', payload: 'showGameMenu'});
			state.showGameMenu = true;
			globalState.gameSocket?.disconnect();
		});
			
		globalState.gameSocket?.on('setgame', () => {
			dispatchGame({
				type: 'TOGGLE',
				payload: 'showGame',
			});
			// globalState.gameSocket?.emit('playerJoined', { gameId: game.gameId })
			state.showGame = true;
		});
		globalState.gameSocket?.on('gameInProgress', () => {
			globalState.gameSocket?.disconnect();
			dispatchGame({ type: 'TOGGLE', payload: 'showGameMenu'});
			state.showGameMenu = true;
		});

		return () => {
			globalState.gameSocket?.off('leave-game');
			globalState.gameSocket?.off('setgame');
			globalState.gameSocket?.off('gameInProgress');
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
			}}>CANCEL</button>
		</div>
	);
};
export default MatchMaking