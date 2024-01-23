import './GameSettings.css'
import React, { useState } from 'react';
// import Image from './setting.png'

const GameSettingsComponent: React.FC = () => {

	const handleGameHistory = async () => {

		try {

			const response = await fetch(`http://localhost:3001/users/getGameHistory/${sessionStorage.getItem("currentUserID")}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				}
			});
	
			if (response.ok) {
				const gameHistoryData = await response.json();
	
				console.log(gameHistoryData);
			}
			else {
				console.log("Error");
			}

		} catch (error) {
			console.error(error);
		}
	}
	
		return (
			<>
				<div className="bloc-game-settings">
					Game
					<form onSubmit={handleGameHistory}>
						<label>
							
						</label>
						<button type="submit">Game History</button>
					</form>
				</div>
			</>
			);

	};
	
	export default GameSettingsComponent;