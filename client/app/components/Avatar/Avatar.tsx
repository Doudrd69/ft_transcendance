import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/app/GlobalContext';
import { response } from 'express';

interface AvatarImageProps {
className?: string; // Prop pour la classe CSS
}

const AvatarImageComponent: React.FC<AvatarImageProps> = ({ className }) => {
const { state } = useGlobal();
const [avatarURL, setAvatarURL] = useState<string | null>(null);

useEffect(() => {
	console.log('=============> dans le use', state.showUploadAvatar)
	const fetchAvatar = async () => {
	try {
		const response = await fetch(`http://localhost:3001/users/getAvatar/${sessionStorage.getItem('currentUserID')}`,{
			method: 'GET',
		});

		if (response.ok) {
			const data = await response.json();
			if (data) {
				console.log(data);
				setAvatarURL(data.avatarURL);
			}
		} else {
		console.error('Error fetching Avatar URL:', response.statusText);
		}
	} catch (error) {
		console.error('Error fetching Avatar URL:', error);
	}
	};

	fetchAvatar();
}, [state.showUploadAvatar]);

return (
		<img src={avatarURL || 'avatars/avatar.png'} className={className}/>
	);
};

export default AvatarImageComponent;