import './SettingsKeyboard.css'
import React from 'react';
import {useGame} from '../../../GameContext'

const SettingsKeyboard: React.FC = () => 
{
	const {} = useGame();
	return (
		<div className="keyboardoption">
			<div className="setting-option">
                <label>The most beautiful:</label>
                <select id="option3">
                <option>mroffi</option>
                <option>wmonacho</option>
                <option>ebrodeur</option>
                </select>
        	</div>
		</div>
	);
}

export default SettingsKeyboard