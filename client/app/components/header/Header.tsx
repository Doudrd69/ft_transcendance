import './header.css'
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validate, validateOrReject } from 'class-validator';

const HeaderComponent: React.FC = () => {

	const [handle2faButton, set2faButtonValue] = useState('');
	const [authenticatorCodeInput, setAuthenticatorCodeInput] = useState('');
	const [username, setUsername] = useState('');
	const [notification, setNotification] = useState(0);

	const notify = (flag: number, error?: string) => { 
		
		switch (flag) {

			case 0:
				return ;
			
			case 1:
				toast.success("Username has been updated");
				return ;

			case 2:
				toast.success("Authenticator code is verified");
				return ;

			case 3:
				toast.warn(error);
				return ;

			case 4:
				toast.success("Two Factor Authentification is now enabled");
				return ;

			case 5:
				toast.warn(error);
				return ;
		}
	};


	const handleAuthenticatorCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAuthenticatorCodeInput(e.target.value);
	};

	const handleUsernameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(e.target.value);
	};

	// Function to generate a QRCode for 2FA
	const activate2FA = async (e: React.FormEvent) => {

		e.preventDefault();

		const tfaDto = {
			userID: sessionStorage.getItem("currentUserID"),
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
			console.log("2FA QRCode => ", qrcode.qrcodeURL);
		}
		else {
			const error = await response.json();
			console.log("Fatal error: ", error.message);
		}
	}

	const checkAuthenticatorCode = async (e: React.FormEvent) => {
		
		e.preventDefault();

		const dto = {
			userID: sessionStorage.getItem("currentUserID"),
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
			notify(4);
			sessionStorage.setItem("2faEnabled", "true");
		}
		else {
			const error = await response.json();
			console.log("Fatal error: ", error.message[0]);
			notify(5, error.message[0]);
		}
	}

	const changeUsername = async (e: React.FormEvent) => {

		e.preventDefault();
		
		const updateUsernameDto = {
			userID: sessionStorage.getItem("currentUserID"),
			newUsername: username,
		};

		const response = await fetch('http://localhost:3001/users/updateUsername', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			},
			body: JSON.stringify(updateUsernameDto),
		});

		if (response.ok) {
			const updatedUser = await response.json();
			console.log("Updated user: ", updatedUser);
			notify(1);
		}
		else {
			const error = await response.json();
			console.log("ERROR: ", error.message[0]);
			notify(3, error.message[0]);
		}
	}

		return (
			<div className="header">
				<h1>BIENVENUE SUR TRANSCENDANCE !</h1>

				<form onSubmit={activate2FA}>
					<button type="submit" value={handle2faButton} >ACTIVATE 2FA</button>
				</form>

				<form onSubmit={checkAuthenticatorCode}>
					<input type="text" placeholder="Authenticator code..." value={authenticatorCodeInput} onChange={handleAuthenticatorCodeInput}></input>
					<button type="submit">CHECK CODE</button>
				</form>

				<form onSubmit={changeUsername}>
					<input type="text" placeholder="Username..." value={username} onChange={handleUsernameInput}></input>
					<button type="submit">Change username</button>
				</form>

			</div>
		);
	};
	
	export default HeaderComponent;