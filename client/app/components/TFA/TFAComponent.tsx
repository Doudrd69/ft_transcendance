import React, { useState } from 'react';

interface TFAComponentProps {
	on2FADone: () => void; // Define the on2FADone prop as a function
  }

const TFAComponent: React.FC<TFAComponentProps>  = ({ on2FADone }) => {


	const [authenticatorCodeInput, setAuthenticatorCodeInput] = useState('');

	const handleAuthenticatorCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAuthenticatorCodeInput(e.target.value);
	};

	const checkAuthenticatorCode = async (e: React.FormEvent) => {
		try {
			e.preventDefault();
	
			const dto = {
				userID: Number(sessionStorage.getItem("currentUserID")),
				code: authenticatorCodeInput,
			}
	
			const response = await fetch('http://localhost:3001/auth/checkAuthenticatorCode', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(dto),
			});
	
			if (response.ok) {
				console.log("-- Code OK, 2FA ENABLED --");
				on2FADone();
			}
		}
		catch (error) {
			console.error(error);
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

// voir react hook-form  pour les form au lieu des useState

export default TFAComponent;