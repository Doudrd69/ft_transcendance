'use client'

import Image from 'next/image'
import React, { useState } from 'react';
import ComponentsLayout from './components/layout';
import ChatView from './components/ChatView'
import DefaultView from './components/DefaultView'
// import styles from './page.module.css'

export default function Home() {

	const [showChat, setShowChat] = useState(false);

	return (
			<ComponentsLayout>

				{showChat ? <ChatView /> : <DefaultView />}
				<button onClick={() => setShowChat(!showChat)}>
					{showChat ? 'Switch to Default View' : 'Switch to Chat View'}
				</button>

			</ComponentsLayout>
	)
}
