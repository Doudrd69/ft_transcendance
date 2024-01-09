import { useGlobal } from '@/app/GlobalContext';
import './HeaderSettings.css';
import React, {useState, useEffect} from 'react';

const HeaderSettingsComponent: React.FC = () => {
  const {state,  dispatch } = useGlobal();
  return (
	<div className="bloc-header-settings">
		<button
		className={`header-settings-button ${state.showProfilsSettings ? 'clicked' : ''}`}
		onClick={() => {
		dispatch({ type: 'ACTIVATE', payload: 'showProfilsSettings' });
		dispatch({ type: 'DISABLE', payload: 'showGameSettings' });
		dispatch({ type: 'DISABLE', payload: 'showGeneralSettings' });

		}}>
			Profils
		</button>

		<button
		className={`header-settings-button ${state.showGeneralSettings ? 'clicked' : ''}`}
		onClick={() => {
		dispatch({ type: 'ACTIVATE', payload: 'showGeneralSettings' });
		dispatch({ type: 'DISABLE', payload: 'showGameSettings' });
		dispatch({ type: 'DISABLE', payload: 'showProfilsSettings' });
		}}>
			2FA
		</button>

		<button
		className={`header-settings-button ${state.showGameSettings ? 'clicked' : ''}`}
		onClick={() => {
		dispatch({ type: 'ACTIVATE', payload: 'showGameSettings' });
		dispatch({ type: 'DISABLE', payload: 'showProfilsSettings' });
		dispatch({ type: 'DISABLE', payload: 'showGeneralSettings' });
		}}>
			Game
		</button>
	</div>
  );
};

export default HeaderSettingsComponent;