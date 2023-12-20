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
				toast("Authenticator code is verified");

			case 3:
				toast.warning(error);
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
			sessionStorage.setItem("2faEnabled", "true");
		}
		else {
			console.log("-- 2FA activation FAILED --");
		}
	}

	// Function to change username
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