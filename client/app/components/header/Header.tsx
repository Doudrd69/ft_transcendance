import './header.css'
import React, { useState } from 'react';

const HeaderComponent: React.FC = () => {

	const [handle2faButton, set2faButtonValue] = useState('');
	const [authenticatorCodeInput, setAuthenticatorCodeInput] = useState('');

	const handleAuthenticatorCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAuthenticatorCodeInput(e.target.value);
	};

	// Function to generate a QRCode for 2FA
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

	// Function to check Authenticator Code
	const checkAuthenticatorCode = async (e: React.FormEvent) => {
		
		e.preventDefault();

		console.log("Code to verify = ", authenticatorCodeInput);
		const code = authenticatorCodeInput;

		const response = await fetch('http://localhost:3001/auth/checkCode', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({code}),
		});

		if (response.ok) {
			console.log("-- Code OK, 2FA ENABLED --");
		}
		else {
			console.log("-- 2FA activation FAILED --");
		}
	}

		return (
			<div className="header">
				<h1>BIENVENUE SUR TRANSCENDANCE !</h1>

				<form onSubmit={handle2FA}>
					<button type="submit" value={handle2faButton} >ACTIVATE 2FA</button>
				</form>

				<form onSubmit={checkAuthenticatorCode}>
					<input type="text" placeholder="Authenticator code..." value={authenticatorCodeInput} onChange={handleAuthenticatorCodeInput}></input>
					<button type="submit" >CHECK CODE</button>
				</form>

			</div>
		);
	};
	
	export default HeaderComponent;