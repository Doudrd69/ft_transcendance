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
	const timestamp = new Date()
		return (
			<div className='bloc-history-title'>
				<div className="title-game"> HISTORY</div>
					<div className='bloc-history'>
						{gameHistory.map((game: gameHistory, index) => (
							<div key={index} className="game-history">
								<div className="game-history-player">
									<img className='img-history' src={`${process.env.API_URL}/users/getAvatar/${game?.playerOneId}/${timestamp}`}/>
									<div className={`game-history-player-name  ${game.scoreP1 > game.scoreP2 ? 'green-text' : 'red-text'}`}>
										{game.playerOne}
									</div>
									<div className="game-history-player-score">
										{game.scoreP1}
									</div>
								</div>
								<div className="game-history-player">
									vs
								</div>
								<div className="game-history-player">
									<img className='img-history' src={`${process.env.API_URL}/users/getAvatar/${game?.playerTwoId}/${timestamp}`}/>
									<div className={`game-history-player-name  ${game.scoreP1 < game.scoreP2 ? 'green-text' : 'red-text'}`}>
											{game.playerTwo}
									</div>
									<div className="game-history-player-score">
										{game.scoreP2}
									</div>
								</div>
							</div>
						))}
				</div>
			</div>
			);

	};
	
	export default HistoryComponent;