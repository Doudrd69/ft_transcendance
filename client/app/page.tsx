'use client'

import React, { use, useState } from 'react';
import ComponentsLayout from './components/layout';
import ChatView from './components/ChatView'
import DefaultView from './components/DefaultView'
// import LoginView from './components/LoginView'
import SignupView from './components/SignupView'
import { useSearchParams } from 'next/navigation'

export default function Home() {

	const handleAccessToken = async (code: any) => {
		console.log("handleAccessToken gets code: " + code);
		const response = await fetch('http://localhost:3001/auth/access', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({code}),
		});

		if (response.ok) {
			console.log("handleAccessToken successfully retreived");
		} else {
			console.error("--handleAccessoToken failed--");
		}
	}

	// const [showLogin, setShowLogin] = useState(false);

	const searchParams = useSearchParams();
	const code = searchParams.get('code');

	if (code) {
		handleAccessToken(code);
	}

	return (
			<ComponentsLayout>

				<div className="420Auth">
					<a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-4d0db0aeaaddb9bee1f99f2e27a7fee7a501130aa05cb3cffe2caf30e50418be&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code">
						<button>Se connecter avec 42</button>
					</a>
				</div>

				{/* {showLogin ? <LoginView /> : <DefaultView />}
				<button onClick={() => setShowLogin(!showLogin)}>
					{showLogin ? 'Switch to Default View' : 'Switch to Login View'}
				</button> */}

			</ComponentsLayout>
	)
}
