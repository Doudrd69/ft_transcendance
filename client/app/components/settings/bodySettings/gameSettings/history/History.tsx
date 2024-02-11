import { useGlobal } from '@/app/GlobalContext';
import './History.css'
import React, { useEffect, useState } from 'react';

interface gameHistory {
	id: number;
	playerOne: string
	playerTwo: string,
	playerOneId: number,
	playerTwoId: number,
	scoreP1: number,
	scoreP2: number,
}

const HistoryComponent: React.FC = () => {

	const { globalState } = useGlobal();
	const [gameHistory, setGameHistory] = useState<gameHistory[]>([]);
	const handleGameHistory = async () => {
			try {
				const response = await fetch(`${process.env.API_URL}/users/getGameHistory/${sessionStorage.getItem("currentUserID")}`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
					}
				});
		
				if (response.ok) {
					const gameHistoryData = await response.json();
					setGameHistory([...gameHistoryData]);
				}
				else {
					console.log("Error");
				}

			} catch (error) {
				console.error(error);
			}
	}

	useEffect(() => {

		
		handleGameHistory();
	}, []);
	
	useEffect(() => {
		globalState.userSocket?.on('refreshGameHistory', () => {
			handleGameHistory();
		});

		return () => {
			globalState.userSocket?.off('refreshGameHistory');
		}
	}, [globalState?.userSocket]);

	const timestamp = new Date()
	return (
		<div className='bloc-history-title'>
			<div className="title-game"> HISTORY</div>
			<div className='bloc-history'>
				{gameHistory.map((game, index) => {
				const reversedIndex = gameHistory.length - 1 - index;
				const gameData = gameHistory[reversedIndex];
					return (
						<div key={index} className="game-history">
							<div className="game-history-player">
								<img className='img-history' src={`${process.env.API_URL}/users/getAvatar/${gameData?.playerOneId}/${timestamp}`}/>
								<div className={`game-history-player-name  ${gameData.scoreP1 > gameData.scoreP2 ? 'green-text' : 'red-text'}`}>
									{gameData.playerOne}
								</div>
								<div className="game-history-player-score">
									{gameData.scoreP1}
								</div>
							</div>
						<div className="game-history-player">
							vs
						</div>
						<div className="game-history-player">
							<img className='img-history' src={`${process.env.API_URL}/users/getAvatar/${gameData?.playerTwoId}/${timestamp}`}/>
							<div className={`game-history-player-name  ${gameData.scoreP1 < gameData.scoreP2 ? 'green-text' : 'red-text'}`}>
								{gameData.playerTwo}
							</div>
							<div className="game-history-player-score">
							{gameData.scoreP2}
							</div>
						</div>
						</div>
					);
				})}
		</div>
		</div>
	);
	
	};
	
	export default HistoryComponent;