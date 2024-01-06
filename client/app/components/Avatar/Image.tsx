import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/app/GlobalContext';
import { response } from 'express';

interface ImageProps {
	className?: string;
}

const ImageComponent: React.FC<ImageProps> = ({ className }) => {

	const { state } = useGlobal();
	const [avatarURL, setAvatarURL] = useState('http://localhost:3000/avatars/avatar.png');
		const fetchAvatar = async () => {
			try {
				console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
				console.log(sessionStorage.getItem('currentUserID'));
				console.log('test1');

				const response = await fetch(`http://localhost:3001/users/getAvatar/${sessionStorage.getItem('currentUserID')}`,{
					method: 'GET',
				});	
				if (response.ok) {
					setAvatarURL(`http://localhost:3001/users/getAvatar/${sessionStorage.getItem('currentUserID')}`)
					setAvatarURL('rien');
					console.log('setAvatarURL en cas de fetch reussie', avatarURL);
				} else {
					setAvatarURL('test')
				console.log('test2');
					console.error('Error fetching Avatar URL:', response.statusText);
				}
			} catch (error) {
				setAvatarURL('test')
				console.log('test3');

				console.error('Error fetching Avatar URL:', error);
			}
		};

		useEffect(() => {
			fetchAvatar();
			console.log(avatarURL);
			console.log('test3');

		}, [state.showRefresh]);
		
	return (
				<img src={avatarURL} className={className} />
		);
};

export default ImageComponent;