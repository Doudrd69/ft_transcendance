import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/app/GlobalContext';

const SetComponent : React.FC = () => {
	const { globalState, dispatch } = useGlobal();
	const [testAvatar, setTestAvatar] = useState(false);
	const [isComponentMounted, setIsComponentMounted] = useState(false);
	const AvatarURL = `http://localhost:3001/users/getAvatar/${sessionStorage.getItem('currentUserID')}`;
	const defaultAvatar = 'avatars/avatar.png';

	const fetchData = async () => {
		try {
		const response = await fetch(`http://localhost:3001/users/getAvatar/${sessionStorage.getItem('currentUserID')}`);

		if (response.ok) {
			dispatch({ type: 'ACTIVATE', payload: 'showAvatar' });
			setTestAvatar(true);
			console.log('-- fetch réussie -- ');
		} else {
			console.error('Error fetching Avatar URL:', response.statusText);
		}
		} catch (error) {
		console.error('Error fetching Avatar URL:', error);
		}

		console.log('État de mon testAVATAR ------->', testAvatar);

		if (testAvatar) {
		dispatch({ type: 'SET', payload: AvatarURL });
		} else {
		dispatch({ type: 'SET', payload: defaultAvatar });
		}
	};

	useEffect(() => {
			fetchData();
	}, [globalState.showAvatar, globalState.showUploadAvatar]);

	console.log('etat dans useEffect', globalState);
	return null;
	};

export default SetComponent;
