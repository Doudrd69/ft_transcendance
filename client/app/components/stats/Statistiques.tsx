import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useChat } from '../chat/ChatContext';
import './Statistiques.css';
import { useGlobal } from '@/app/GlobalContext';
import { toast } from 'react-toastify';


interface gameHistory {
	id: number;
	playerOne: string
	playerTwo: string,
	playerOneId: number,
	playerTwoId: number,
	scoreP1: number,
	scoreP2: number,
}

interface targetStat{
	id: number;
	username: string;
}


interface StatsUsers{
	victory: number;
	defeat: number;
	ratio: number;
}


const StatistiquesComponent: React.FC = () => {

	const [gameHistory, setGameHistory] = useState<gameHistory[]>([]);
	const { chatState, chatDispatch } = useChat();
	// const [targetStat] = useState<targetStat>({id : chatState.currentTargetStats.id, username: chatState.currentTargetStats.username});
	const [statsUsers, setStatsUser] = useState<StatsUsers>();
	const handleStats = async () => {
		try {
			const response = await fetch(`${process.env.API_URL}/users/getUserStats/${chatState.currentTargetStats[0].id}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				}
			});
	
			if (response.ok) {
				const stats = await response.json();
				setStatsUser(stats);
			}
			else {
				console.log("Error");
			}

		} catch (error) {
			console.error(error);
		}
	}
	useEffect(() => {
		handleStats();
	}, []);

	const handleGameHistory = async () => {

		try {

			const response = await fetch(`${process.env.API_URL}/users/getGameHistory/${chatState.currentTargetStats[0].id}`, {
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
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}

		} catch (error) {
			console.error(error);
		}
	}
	const timestamp = new Date()
	useEffect(() => {
		handleGameHistory();
	}, []);

	const handleCancel = () => {
		chatDispatch({ type: 'DISABLE', payload: 'showStatistiques' });
		chatDispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });
	};

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				handleCancel();
			}
		};
	
		document.addEventListener('keydown', handleEscape);
	
		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, []);
	return (
		<>

			<div className="blur-background"></div>
			<img className="add_button_cancel" src='./close.png'  onClick={handleCancel}/>
			<div className='targer-stats'> Statistics of {chatState.currentTargetStats[0].username}</div>
			<div className="statistiques-container">
				<div className='bloc-statistiques-history'>
					<div className="statistiques-history-title">History</div>
						<div className="bloc-statistiques-history-content">
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
				<div className='bloc-statistiques-stats'>	
						<div className='statistiques-stats-title'>Stats</div>
						<div className='statistiques-stats'>
							<div className='statistiques-stats-victory'> Victory : {statsUsers?.victory}</div>
							<div className='statistiques-stats-defeat'> Defeat : {statsUsers?.defeat} </div>
							<div className='statistiques-stats-winrate'> Winrate : {statsUsers?.ratio.toFixed(1)}% </div>
						</div>
				</div>
			</div>
		</>
	);
};
export default StatistiquesComponent;