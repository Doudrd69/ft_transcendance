import { useGlobal } from '@/app/GlobalContext';
import React, { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useChat } from '../chat/ChatContext';
import './Header.css';
import { useRouter } from 'next/router';


const HeaderComponent: React.FC = () => {

	const {chatDispatch} = useChat();
	const { globalState, dispatch } = useGlobal();
	const timestmp = new Date();

	const uploadAvatar =  () => {
		dispatch({ type: 'ACTIVATE', payload: 'showUploadAvatar' });
	}

	const handleLogout = () => {

		localStorage.clear();
		sessionStorage.clear();
		window.history.replaceState(null, '', '/');
		window.location.reload();
	}

	useEffect(() => {
		uploadAvatar();
	}, [globalState.showRefresh]);

	const renderComponent = (component: React.ReactNode, condition: boolean) =>
		condition ? component : null;

	return (
		<div className="header">
			<div className="bloc-profils">
				<button className="button-profils"
					onClick={() => {
					if (!globalState.showSettings) {
						dispatch({ type: 'TOGGLEX', payload: 'showSettings' });
						dispatch({ type: 'ACTIVATE', payload: 'showProfilsSettings'});
						chatDispatch({ type: 'DISABLE', payload: 'showBackComponent' });
					} 
					else {
						dispatch({ type: 'DISABLE', payload: 'showSettings' });
						dispatch({ type: 'DISABLE', payload: 'showGeneralSettings'});
						dispatch({ type: 'DISABLE', payload: 'showProfilsSettings'});
						dispatch({ type: 'DISABLE', payload: 'showGameSettings'});
						chatDispatch({ type: 'DISABLE', payload: 'showBackComponent' });

					}}}>
					<img className='profils' src={`${process.env.API_URL}/users/getAvatar/${sessionStorage.getItem("currentUserID")}/${timestmp}`}/>
					<div className='username'>{sessionStorage.getItem("currentUserLogin")}</div>

					{/* {renderComponent(<AvatarImageComponent className="profils" refresh={globalState.showRefresh}/>, globalState.showUploadAvatar)} */}
				</button>
			</div>
		<div className="bloc-pong">PING PON</div>
		<div className="bloc-logout">
			<button className="button-logout" onClick={() => handleLogout()}></button>
		</div>
		<div className="bloc-settings">
			<button
				className="button-settings"
				onClick={() => {
				if (!globalState.showSettings) {
					dispatch({ type: 'TOGGLEX', payload: 'showSettings' });
					dispatch({ type: 'ACTIVATE', payload: 'showGeneralSettings'});
					dispatch({ type: 'DISABLE', payload: 'showBackComponent' });
				} else {
					dispatch({ type: 'DISABLE', payload: 'showSettings' });
					dispatch({ type: 'DISABLE', payload: 'showGeneralSettings'});
					dispatch({ type: 'DISABLE', payload: 'showProfilsSettings'});
					dispatch({ type: 'DISABLE', payload: 'showGameSettings'});
					dispatch({ type: 'DISABLE', payload: 'showBackComponent' });

				}
			}}>
				<img className="settings" src='./settings.png' alt="Settings" />
			</button>
		</div>
	</div>
	);
};

export default HeaderComponent;
