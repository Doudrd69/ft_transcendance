import './SettingsDisplay.css'
import React from 'react';
import {useGame} from '../../../GameContext'

const SettingsDisplay: React.FC = () => 
{
	return (
		<div className="displayoption">
			<div className="setting-option">
                <label>The taller:</label>
                <select id="option1">
                <option>wmonacho</option>
                <option>ebrodeur</option>
                <option>mroffi</option>
                </select>
            </div>
		</div>
	)
}

export default SettingsDisplay