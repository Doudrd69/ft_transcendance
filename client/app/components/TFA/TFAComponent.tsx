import React, { use, useEffect, useState } from 'react';
import { useGlobal } from '../../GlobalContext';
import { toast } from 'react-toastify';
import './TFAComponent.css'

const TFAComponent: React.FC  = () => {

	const { globalState, dispatch } = useGlobal();
	const [authenticatorCodeInput, setAuthenticatorCodeInput] = useState('');

	const handleAuthenticatorCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAuthenticatorCodeInput(e.target.value);
	};

	
	const checkAuthenticatorCode = async (e: React.FormEvent) => {
		try {
			e.preventDefault();
	
			const dto = {
				userID: Number(sessionStorage.getItem("currentUserID")),
				code: String(authenticatorCodeInput),
			}

			const response = await fetch(`${process.env.API_URL}/auth/checkAuthenticatorCode`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(dto),
			});
	
			if (response.ok) {
				dispatch({ type: 'ACTIVATE', payload: 'isConnected' });
			}
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	return (
		<div className="tfaClass">
			{/* <img className="tfa-img" src="./terrifiant.webp"></img> */}
			<form className="tfa-form" onSubmit={checkAuthenticatorCode}>
				<input className="tfa-form-input" type="text" placeholder="Authenticator code..." value={authenticatorCodeInput} onChange={handleAuthenticatorCodeInput}></input>
				<button className="tfa-form-button" type="submit" >Validate</button>
			</form>
		</div>
	);
};

// voir react hook-form  pour les form au lieu des useState

export default TFAComponent;