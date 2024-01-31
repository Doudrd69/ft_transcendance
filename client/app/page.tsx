"use client"

import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { GlobalProvider } from './GlobalContext';
import GeneralComponent from './general';
import RootLayout from './layout';

export default function Home() {

		return (
			<RootLayout>
				<GlobalProvider>
					<GeneralComponent/>
				</GlobalProvider>
			</RootLayout>
		);
}