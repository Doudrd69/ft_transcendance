import './GameSettings.css'
import React, { useEffect, useState } from 'react';
import HistoryComponent from './history/History';
import StatsComponent from './stats/Stats';
import { Stats } from 'fs';

const GameSettingsComponent: React.FC = () => {
		return (
				<div className="bloc-game-settings">
					<HistoryComponent/>
					<StatsComponent/>
				</div>
			);
	};
	
	export default GameSettingsComponent;