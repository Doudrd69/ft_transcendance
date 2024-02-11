"use client"

import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { GlobalProvider } from './GlobalContext';
import GeneralComponent from './general';
import RootLayout from './layout';
import { GameProvider } from './components/game/GameContext';

export default function Home() {

		return (
			<RootLayout>

				<GlobalProvider>
					<GameProvider>
						<GeneralComponent/>
					</GameProvider>

				</GlobalProvider>
			</RootLayout>
		);
}