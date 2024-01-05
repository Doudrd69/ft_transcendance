import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/app/GlobalContext';
import { response } from 'express';

interface AvatarImageProps {
	className?: string;
	refresh?: boolean;
}

const AvatarImageComponent: React.FC<AvatarImageProps> = ({ className , refresh}) => {

	const { state, dispatch } = useGlobal();

	const [avatarURL, setAvatarURL] = useState('/avatars/avatar.png');
	const fetchAvatar = async () => {

		try {
			console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
			console.log(sessionStorage.getItem('currentUserID'));
			console.log('test1');

			const response = await fetch(`http://localhost:3001/users/getAvatar/${sessionStorage.getItem('currentUserID')}`,{
				method: 'GET',
			});
			console.log('response', response);	
			if (response.ok) {
				setAvatarURL(`http://localhost:3001/users/getAvatar/${sessionStorage.getItem('currentUserID')}`)
				console.log('setAvatarURL en cas de fetch reussie', avatarURL);
			} else {
				console.error('Error fetching Avatar URL:', response.statusText);
			}
		} catch (error) {
			console.error('Error fetching Avatar URL:', error);
		}
	};

	useEffect(() => {
		fetchAvatar();
	}, [state.showUploadAvatar]);
	return (
			<img src={avatarURL} className={className} title={`Refresh: ${refresh}`}/>
		);
};

export default AvatarImageComponent;