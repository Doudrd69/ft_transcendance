import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/app/GlobalContext';
import { response } from 'express';

interface ImageProps {
	className?: string;
}

const ImageComponent: React.FC<ImageProps> = ({ className }) => {

	const { globalState } = useGlobal();
	const [avatarURL, setAvatarURL] = useState('http://localhost:3000/avatars/avatar.png');
		const fetchAvatar = async () => {
			try {

				const response = await fetch(`${process.env.API_URL}/users/getAvatar/${sessionStorage.getItem('currentUserID')}`,{
					method: 'GET',
				});	
				if (response.ok) {
					setAvatarURL(`${process.env.API_URL}/users/getAvatar/${sessionStorage.getItem('currentUserID')}`)
					setAvatarURL('rien');
				} else {
					setAvatarURL('test')
					console.error('Error fetching Avatar URL:', response.statusText);
				}
			} catch (error) {
				setAvatarURL('test')
				console.error(error);
			}
		};

		useEffect(() => {
			fetchAvatar();
		}, [globalState.showRefresh]);
		
	return (
				<img src={avatarURL} className={className} />
		);
};

export default ImageComponent;