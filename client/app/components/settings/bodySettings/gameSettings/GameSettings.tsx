import './GameSettings.css'
import React, { useEffect, useState } from 'react';
import HistoryComponent from './history/History';
import StatsComponent from './stats/Stats';
import { toast } from 'react-toastify';

const GameSettingsComponent: React.FC = () => {

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
	
		return (
				<div className="bloc-game-settings">
					<HistoryComponent/>
					<StatsComponent/>
				</div>
			);
	};
	
	export default GameSettingsComponent;