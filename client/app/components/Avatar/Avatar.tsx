import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/app/GlobalContext';

interface AvatarImageProps {
	className?: string;
	refresh?: boolean;
	name?: string;
}

const AvatarImageComponent: React.FC<AvatarImageProps> = ({ className, refresh, name}) => {

	const { globalState, dispatch } = useGlobal();
	const defaultAvatar = 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/corporate-user-icon.png';

	const [isDefault, setDefault] = useState(true);
	const userLogin = name;
	const userId = sessionStorage.getItem('currentUserID');
	const timestamp = new Date().getTime();
	var url : string;
	if (name){
		
		url = `http://localhost:3001/users/getAvatarByLogin/${userLogin}/${timestamp}`;
	}
	else {
		url = `http://localhost:3001/users/getAvatar/${userId}/${timestamp}`;
	}


	const fetchAvatar = async () => {
			try {
				let response;
				if (userLogin) {
					response = await fetch(url, {
						method: 'GET',
					});
				} else {
					response = await fetch(url, {
						method: 'GET',
					});
				}
			if (response.ok) {
				console.log('fetchAvatar OK');
			} else {
				
				setDefault(false);
				console.error('Error fetching Avatar URL:', response.statusText);
			}
		} catch (error) {
			console.error('Error fetching Avatar URL:', error);
		}

	};

	useEffect(() => {
		fetchAvatar();
	}, [globalState.showUploadAvatar]);
	return (
					<img src={url} className={className} alt="User Avatar" />	
	);
};

export default AvatarImageComponent;
