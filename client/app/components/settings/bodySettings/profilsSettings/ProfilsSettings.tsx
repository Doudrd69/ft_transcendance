// ProfilsSettingsComponent.tsx
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/app/GlobalContext';
import './ProfilsSettings.css';
import FileDropZoneComponent from './fileDropZone/FileDropZone';
import AvatarImageComponent from '@/app/components/Avatar/Avatar';

const ProfilsSettingsComponent: React.FC = () => {
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
		toast('Authenticator code is verified');
	}
	};

	const usernameDto = {
	login: sessionStorage.getItem('currentUserLogin'),
	string: username,
	};

	const handleUsernameSubmit = async (event: React.FormEvent) => {
	event.preventDefault();

	try {
		const response = await fetch('http://localhost:3001/users/updateUsername', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ usernameDto }),
		});

		if (response.ok) {
			console.log('Nom d\'utilisateur envoyé avec succès au backend');
			notify(1);
		} else {
		console.error('Échec de l\'envoi du nom d\'utilisateur au backend');
		console.log('Backend Response:', response);
		}
	} catch (error) {
		console.error('Erreur lors de l\'envoi du nom d\'utilisateur au backend :', error);
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
			console.log('avant------------>', state.showUploadAvatar);
			dispatch({ type: 'TOGGLEX', payload: 'showUploadAvatar' })
			console.log('apres------------>', state.showUploadAvatar);
			
		}
		else
			console.error('Échec de l\'envoi de l\'image au backend');
		} 
		catch (error) {
			console.error('Erreur lors de l\'envoi de l\'image au backend :', error);
		}
	};
	const [imageURL, setImageURL] = useState<string | null>(null);
	// Utilisez useEffect pour mettre à jour l'URL de l'image lorsque newImage change
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
			{imageURL ? (
				<img src={imageURL} alt="Profile Image" className="profil-image" />
				) : (<AvatarImageComponent className="profil-image"/>
						)}
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
				<button className="button-modified-username" type="submit">Envoyer</button>
			</form>
			</div>
		</div>
	);
};

export default ProfilsSettingsComponent;