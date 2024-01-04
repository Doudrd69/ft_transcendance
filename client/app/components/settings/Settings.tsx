import './Settings.css'
import React, { useState } from 'react';
import HeaderSettingsComponent from './headerSettings/HearderSettings';
import BodySettingsComponent from './bodySettings/BodySettings';

const SettingsComponent: React.FC = () => {

	
		return (
			<div className="back-settings">
				<div className="window-settings">
					<HeaderSettingsComponent></HeaderSettingsComponent>
					<BodySettingsComponent></BodySettingsComponent>
				</div>
			</div>
			);

	};
	
	export default SettingsComponent;