import './Stats.css'
import React, { useEffect, useState } from 'react';

interface StatsUsers{
		victory: number;
		defeat: number;
		ratio: number;
}

const StatsComponent: React.FC = () => {
	const [statsUsers, setStatsUser] = useState<StatsUsers>();
	const handleGameHistory = async () => {
		try {
			const response = await fetch(`http://localhost:3001/users/getUserStats/${sessionStorage.getItem("currentUserID")}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				}
			});
	
			if (response.ok) {
				const stats = await response.json();
				console.log(stats);
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
		handleGameHistory();
	}, []);
	
		return (
			 <div className="bloc-stats">
					<div className="title-stats">STATS</div>
					<div className='victory'>
						Victory : {statsUsers?.victory}
					</div>
					<div className='defeat'>
						Defeat : {statsUsers?.defeat}
					</div>
					<div className='winrate'>
						Winrate : {statsUsers?.ratio.toFixed(1)}%
					</div>
			</div>
			);

};
export default StatsComponent;