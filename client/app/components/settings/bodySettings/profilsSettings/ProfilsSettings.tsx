// ProfilsSettingsComponent.tsx
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/app/GlobalContext';
import './ProfilsSettings.css';
import FileDropZoneComponent from './fileDropZone/FileDropZone';
import AvatarImageComponent from '@/app/components/Avatar/Avatar';
import { Socket } from 'socket.io-client'

const ProfilsSettingsComponent: React.FC = () => {

	const [newImage, setNewImage] = useState<File | null>(null);
	const [username, setUsername] = useState('');
	const { globalState, dispatch } = useGlobal();

	const handleUsernameSubmit = async (event: React.FormEvent) => {
		
		event.preventDefault();
		
		try {

			const usernameDto = {
				userID: Number(sessionStorage.getItem('currentUserID')),
				newUsername: username,
			};

			const response = await fetch(`${process.env.API_URL}/users/updateUsername`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				},
				body: JSON.stringify(usernameDto),
			});
			console.log(JSON.stringify(usernameDto));
			console.log(sessionStorage.getItem("jwt"));

			if (response.ok) {

				const userName = await response.json();
				const { newUsername } = userName;
				sessionStorage.setItem("currentUserLogin", newUsername);
				globalState.userSocket?.emit('joinRoom',  { roomName: sessionStorage.getItem("currentUserLogin"), roomID: '' });
				globalState.userSocket?.emit('refreshUserChannelList', { userToRefresh: newUsername });
				// globalState.userSocket?.emit('refreshGlobalList');
				globalState.userSocket?.emit('refreshUserList');
				globalState.userSocket?.emit('refreshHeader');
				toast.success('Username has been updated');
			} else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
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

				const response = await fetch(`${process.env.API_URL}/users/upload-avatar`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
					},
					body: formData,
				});

				if (response.ok) {
					dispatch({ type: 'ACTIVATE', payload: 'showAvatar' });
					dispatch({ type: 'DISABLE', payload: 'showUploadAvatar' });
					dispatch({ type: 'TOGGLEX', payload: 'showRefresh'});
				}
				else {
					const error = await response.json();
					if (Array.isArray(error.message))
						toast.warn(error.message[0]);
					else
						toast.warn(error.message);
				}
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
			<div className='bloc-change-username'>
				<div className="change-username">
					<form onSubmit={handleUsernameSubmit} className='form-username'>
						<label className="form-change-username">
							<input className="input-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
						</label>
					</form>
					<button className="button-modified-username" type="submit" onClick= {handleUsernameSubmit}>Update Username</button>
				</div>
			</div>
		</div>
	);
};

export default ProfilsSettingsComponent;