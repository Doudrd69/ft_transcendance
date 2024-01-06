import { useGlobal } from '@/app/GlobalContext';
import './Header.css'
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AvatarImageComponent from '../Avatar/Avatar';
import { validate, validateOrReject } from 'class-validator';


const HeaderComponent: React.FC = () => {
	const { state, dispatch } = useGlobal();

	// const notify = (flag: number, string?: string) => { 
		
	// 	switch (flag) {

	// 		case 0:
	// 			return ;
			
	// 		case 1:
	// 			toast.success(string);
	// 			return ;

	// 		case 2:
	// 			toast.warn(string);
	// 			return ;
	// 	}
	// };


	// const handleAuthenticatorCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	setAuthenticatorCodeInput(e.target.value);
	// };

	// const handleUsernameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	setUsername(e.target.value);
	// };

	// // Function to generate a QRCode for 2FA
	// const activate2FA = async (e: React.FormEvent) => {

	// 	e.preventDefault();

	// 	const tfaDto = {
	// 		userID: Number(sessionStorage.getItem("currentUserID")),
	// 	}

	// 	const response = await fetch('http://localhost:3001/auth/request2fa', {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
	// 		},
	// 		body: JSON.stringify(tfaDto),
	// 	});

	// 	if (response.ok) {
	// 		const qrcode = await response.json();
	// 		console.log("2FA QRCode => ", qrcode.qrcodeURL);
	// 	}
	// 	else {
	// 		const error = await response.json();
	// 		console.log("Fatal error: ", error.message);
	// 	}
	// }

	// const checkAuthenticatorCode = async (e: React.FormEvent) => {
		
	// 	e.preventDefault();

	// 	const dto = {
	// 		userID: Number(sessionStorage.getItem("currentUserID")),
	// 		code: authenticatorCodeInput,
	// 	}

	// 	const response = await fetch('http://localhost:3001/auth/checkAuthenticatorCode', {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
	// 		},
	// 		body: JSON.stringify(dto),
	// 	});

	// 	if (response.ok) {
	// 		notify(1, "Two Factor Authentification is now enabled");
	// 		sessionStorage.setItem("2faEnabled", "true");
	// 	}
	// 	else {
	// 		const error = await response.json();
	// 		if (Array.isArray(error.message))
	// 			notify(2, error.message[0]);
	// 		else
	// 			notify(2, error.message);
	// 	}
	// }

	// const changeUsername = async (e: React.FormEvent) => {

	// 	e.preventDefault();

	// 	const updateUsernameDto = {
	// 		userID: Number(sessionStorage.getItem("currentUserID")),
	// 		newUsername: username,
	// 	};

	// 	console.log(updateUsernameDto);
	// 	const response = await fetch('http://localhost:3001/users/updateUsername', {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
	// 		},
	// 		body: JSON.stringify(updateUsernameDto),
	// 	});

	// 	if (response.ok) {
	// 		const updatedUser = await response.json();
	// 		console.log("Updated user: ", updatedUser);
	// 		notify(1, "Username has been updated");
	// 	}
	// 	else {
	// 		const error = await response.json();
	// 		if (Array.isArray(error.message))
	// 			notify(2, error.message[0]);
	// 		else
	// 			notify(2, error.message);
	// 	}
	// }

	// };
	const uploadAvatar =  () => {
		dispatch({ type: 'ACTIVATE', payload: 'showUploadAvatar' });
	}
	useEffect(() => {
		uploadAvatar();
	}, [state.showRefresh]);

	const renderComponent = (component: React.ReactNode, condition: boolean) =>
		condition ? component : null;
	return (
		<div className="header">
			<div className="bloc-profils">
				<button className="button-profils"
					onClick={() => {
					if (!state.showSettings) {
						dispatch({ type: 'TOGGLEX', payload: 'showSettings' });
						dispatch({ type: 'ACTIVATE', payload: 'showProfilsSettings'});
					} 
					else {
						dispatch({ type: 'DISABLE', payload: 'showSettings' });
						dispatch({ type: 'DISABLE', payload: 'showGeneralSettings'});
						dispatch({ type: 'DISABLE', payload: 'showProfilsSettings'});
						dispatch({ type: 'DISABLE', payload: 'showGameSettings'});
					}}}>
						{renderComponent(<AvatarImageComponent className="profils" refresh={state.showRefresh}/>, state.showUploadAvatar)}
				</button>
		</div>

		<div className="bloc-pong">PONG&CHAT</div>
		<div className="bloc-settings">
			<button
				className="button-settings"
				onClick={() => {
				if (!state.showSettings) {
					dispatch({ type: 'TOGGLEX', payload: 'showSettings' });
					dispatch({ type: 'ACTIVATE', payload: 'showGeneralSettings'});
				} else {
					dispatch({ type: 'DISABLE', payload: 'showSettings' });
					dispatch({ type: 'DISABLE', payload: 'showGeneralSettings'});
					dispatch({ type: 'DISABLE', payload: 'showProfilsSettings'});
					dispatch({ type: 'DISABLE', payload: 'showGameSettings'});
				}
			}}>
				<img className="settings" src='./settings.png' alt="Settings" />
			</button>
		</div>
	</div>
	);
};

export default HeaderComponent;
