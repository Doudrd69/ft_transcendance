import './SettingsGame.css'
import React from 'react';
import {useGame} from '../../../GameContext'

const SettingsGame: React.FC = () => 
{
	return (
		<div className="gameoption">
			<div className="setting-option">
                <label>The strongest:</label>
                <select id="option2">
                <option>ebrodeur</option>
                <option>mroffi</option>
                <option>wmonacho</option>
                </select>
            </div>
		</div>
	)
}

export default SettingsGame