import './GlobalSettings.css';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const GlobalSettingsComponent: React.FC = () => {

	const [authenticatorCodeInput, setAuthenticatorCodeInput] = useState('');
	const [urlQrCode, setUrlQrCode] = useState('');
	const handleAuthenticatorCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAuthenticatorCodeInput(e.target.value);
	};
	const [activeUrlImg, setActiveUrlImg] = useState(false);

	const desactivate2FA = async () => {
	
		try{

			const tfaDto = {
				userID: Number(sessionStorage.getItem("currentUserID")),
			}
		
			const response = await fetch('http://localhost:3001/auth/desactivate2fa', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(tfaDto),
			});
		
			if (response.ok) {
				const status = await response.json();
				sessionStorage.setItem("2faEnabled", `${status}`);
				setActiveUrlImg(false);
				toast.warn("2fa is now disabled");
		}
		}
		catch (error) {
			console.error(error);
		}
	}

	const activate2FA = async () => {

		try {

			const tfaDto = {
				userID: Number(sessionStorage.getItem("currentUserID")),
			}
	
			const response = await fetch('http://localhost:3001/auth/request2fa', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(tfaDto),
			});
	
			if (response.ok) {
				const qrcode = await response.json();
				setUrlQrCode(qrcode.qrcodeURL);
				setActiveUrlImg(true);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const checkAuthenticatorCode = async (e: React.FormEvent) => {
		try{

			e.preventDefault();
	
			const dto = {
			userID: Number(sessionStorage.getItem("currentUserID")),
			code: authenticatorCodeInput,
			}
	
			const response = await fetch('http://localhost:3001/auth/checkAuthenticatorCode', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			},
			body: JSON.stringify(dto),
			});
	
			if (response.ok) {
				toast.success('2FA is now enabled');
				sessionStorage.setItem("2faEnabled", "true");
			} else {
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

	useEffect(() => {
		console.log("urlImg = ", activeUrlImg);
		sessionStorage.getItem("2faEnabled") === "true" ? setActiveUrlImg(true) : setActiveUrlImg(false);
	},[]);
	
	return (
		<div className="bloc-global-settings">
				
		{!activeUrlImg ? 
			<button className='activate2fa' onClick={(e) => {
				activate2FA();
			}}>Activate 2FA</button> 
			: 
			<button className='desactivate2fa' onClick={(e) => {
				desactivate2FA();
			}}>Disable 2FA</button> }

			{activeUrlImg ? 
			<img src={urlQrCode} className='qr-code-img' alt="QR Code" /> 
			: 
			<img src="https://i0.wp.com/www.mathematices.be/wp-content/uploads/2019/11/téléchargement.png?resize=256%2C256&ssl=1" className='qr-code-img-blur' alt="QR Code"/>}
			
			<input
				className='input-field-2fa'
				placeholder="Authenticator code"
				value={authenticatorCodeInput}
				onChange={handleAuthenticatorCodeInput}
			/>

			<button className='check-authenticator-btn' onClick={checkAuthenticatorCode}>Check Authenticator Code</button>
		</div>
);
};

export default GlobalSettingsComponent;
