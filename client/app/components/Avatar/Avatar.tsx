import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/app/GlobalContext';

interface AvatarImageProps {
	className?: string;
	refresh?: boolean;
}

const AvatarImageComponent: React.FC<AvatarImageProps> = ({ className, refresh }) => {
	const { state, dispatch } = useGlobal();
	const defaultAvatar = 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/corporate-user-icon.png';

	const [isDefault, setDefault] = useState(true);

	const userId = sessionStorage.getItem('currentUserID');
	const timestamp = new Date().getTime();
	var urlWithTimestamp = `http://localhost:3001/users/getAvatar/${userId}/${timestamp}`;

	const fetchAvatar = async () => {
			try {
			const response = await fetch(urlWithTimestamp, {
				method: 'GET',
			});

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
	}, [state.showUploadAvatar]);
	return (
		<>
			{isDefault ? (
					<img src={urlWithTimestamp} className={className} alt="User Avatar" />
				) : (
				<img src={defaultAvatar} className={className} alt="User Avatar" />
				) }

		</>
	);
};

export default AvatarImageComponent;
