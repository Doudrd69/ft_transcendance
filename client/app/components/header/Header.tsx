import './header.css'
import React, { useState } from 'react';

const HeaderComponent: React.FC = () => {

	const [buttonValue, setButtonValue] = useState('');
	const [checkCodeValue, setcheckCodeValue] = useState('');
	const [showQRCode, setShowQRCode] = useState(false);

	// const handleButtonInput = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	setButtonValue(e.target.value); // Update conversationValue state with the input value
	// };

	const handle2FA = async (e: React.FormEvent) => {

		e.preventDefault();

		const login = "ebrodeur";

		const response = await fetch('http://localhost:3001/auth/2fa', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({login}),
		});

		if (response.ok) {
			const qrcode = await response.json();
			console.log("QRCODE ready for display");
			console.log(qrcode.qrcodeURL);
			// afficher le qrcode proprement
		}
		else {
			console.log("QRCODE failed to display");
		}
	}

	// fair eun input pour rentrer le code de verif
	const checkAuthenticatorCode = async () => {
		
		const test = "101276";

		const response = await fetch('http://localhost:3001/auth/checkCode', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({test}),
		});

		if (response.ok) {
			console.log("-- Code OK / 2FA ACTIVATED --");
		}
		else {
			console.log("-- 2FA activation FAILED --");
		}
	}

		return (
			<div className="header">
				<h1>BIENVENUE SUR TRANSCENDANCE !</h1>
				<form onSubmit={handle2FA}>
					<button type="submit" value={buttonValue} >ACTIVATE 2FA</button>
				</form>
				<form onSubmit={checkAuthenticatorCode}>
					<button type="submit" value={checkCodeValue} >CHECK 2FA</button>
				</form>
			</div>
		);
	};
	
	export default HeaderComponent;