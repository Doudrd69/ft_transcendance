// ProfilsSettingsComponent.tsx
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/app/GlobalContext';
import './ProfilsSettings.css';
import FileDropZoneComponent from './fileDropZone/FileDropZone';
import AvatarImageComponent from '@/app/components/Avatar/Avatar';
import { Socket } from 'socket.io-client'

interface ProfileSettingsComponentProps {
	userSocket: Socket;
}

const ProfilsSettingsComponent: React.FC<ProfileSettingsComponentProps> = ({ userSocket }) => {

	const [newImage, setNewImage] = useState<File | null>(null);
	const [username, setUsername] = useState('');
	const { state, dispatch } = useGlobal();

	const notify = (flag: number) => {

		switch (flag) {

			case 0:
				return;

			case 1:
				toast.success('Username has been updated');
				return;

			case 2:
				toast.success('Authenticator code is verified');
		}
	};

	const handleUsernameSubmit = async (event: React.FormEvent) => {
		
		event.preventDefault();
		
		try {

			const usernameDto = {
				userID: Number(sessionStorage.getItem('currentUserID')),
				newUsername: username,
			};

			const response = await fetch('http://localhost:3001/users/updateUsername', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				},
				body: JSON.stringify(usernameDto),
			});

			if (response.ok) {
				const userName = await response.json();
				const { newUsername } = userName;
				console.log("newusername: ", newUsername);
				if (!userName) {
					toast.warn("Error: username is already used");
					return ;
				}
				else {
					sessionStorage.setItem("currentUserLogin", newUsername);
					// emit pour update la room du user
					userSocket.emit('joinRoom',  { roomName: sessionStorage.getItem("currentUserLogin"), roomID: sessionStorage.getItem("currentUserID") });
					notify(1);
				}
			} else {
				const error = await response.json();
				toast.warn(error.message[0]);
				console.error('Fatal error: request failed');
			}
		} catch (error) {
			console.error('Fatal error:', error);
		}
	};

	const handleImage = async () => {
		try {
			const formData = new FormData();
			if (newImage && newImage instanceof File) {
				formData.append('avatar', newImage, newImage.name);
				}
			
				const response = await fetch(`http://localhost:3001/users/upload-Avatar/${sessionStorage.getItem('currentUserID')}`, {
				method: 'POST',
				body: formData,
			});
			if (response.ok){
				console.log('Image envoyée avec succès au backend');
				dispatch({ type: 'ACTIVATE', payload: 'showAvatar' });
				dispatch({ type: 'DISABLE', payload: 'showUploadAvatar' });
				dispatch({ type: 'TOGGLEX', payload: 'showRefresh'});
				
			}
		} 
		catch (error) {
			console.error(error);
		}
	};

	const [imageURL, setImageURL] = useState<string | null>(null);
	useEffect(() => {
		if (newImage) {
			const fileReader = new FileReader();
			fileReader.onload = (event) => {
				if (event && event.target) {
					const imageBase64 = event.target.result as string;
					setImageURL(imageBase64);
				}
			};
			fileReader.readAsDataURL(newImage);
		} else {
			setImageURL(null);
		}
	}, [newImage]);
	return (
		<div className="bloc-profils-settings">
			<div className="upload-image">
			{imageURL ?
				(<img src={imageURL} alt="profile-image" className="profil-image" />) 
				:
				(<AvatarImageComponent className="profil-image"/>)}
				<FileDropZoneComponent onChange={(newImage) => setNewImage(newImage)} />
				<button className="button-modified-image" onClick={() => {handleImage()}}>
					Update Avatar
				</button>
			</div>
			<div className="change-username">
				<form onSubmit={handleUsernameSubmit}>
					<label className="form-change-username">
						Update Username:
						<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
					</label>
				</form>
				<button className="button-modified-username" type="submit">Update Username</button>
			</div>
		</div>
	);
};

export default ProfilsSettingsComponent;