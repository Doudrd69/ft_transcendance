import React, { useState } from 'react';

const TFAComponent: React.FC = () => {


	const [authenticatorCodeInput, setAuthenticatorCodeInput] = useState('');

	const handleAuthenticatorCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAuthenticatorCodeInput(e.target.value);
	};

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
			sessionStorage.setItem("2faEnabled", "true");
		}
		else {
			console.log("-- 2FA activation FAILED --");
		}
	}

	return (
		<div className="tfaClass">
			<form onSubmit={checkAuthenticatorCode}>
				<input type="text" placeholder="Authenticator code..." value={authenticatorCodeInput} onChange={handleAuthenticatorCodeInput}></input>
				<button type="submit" >CHECK CODE</button>
			</form>
		</div>
	);
};

export default TFAComponent;