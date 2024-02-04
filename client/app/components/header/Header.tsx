import { useGlobal } from '@/app/GlobalContext';
import React, { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useChat } from '../chat/ChatContext';
import './Header.css';
import { useState } from 'react';
import { toast } from 'react-toastify';


interface FriendShip {
	id: number;
	username: string;
	isBlocked: boolean;
	onlineStatus: boolean;
}

const HeaderComponent: React.FC = () => {

	const {chatDispatch} = useChat();
	const { globalState, dispatch } = useGlobal();
	const timestmp = new Date();
	const [notify, setNotify] = useState<FriendShip[]>([]);
	const [showActivateNotif, setShowActivateNotif] = useState(false);
	const [newNotifications, setNewNotifications] = useState(false);
	const [reloadNotifications, setReloadNotifications] = useState(false);

	const uploadAvatar =  () => {
		dispatch({ type: 'ACTIVATE', payload: 'showUploadAvatar' });
	}

	const handleLogout = () => {

		localStorage.clear();
		sessionStorage.clear();
		globalState.userSocket?.disconnect();
		globalState.gameSocket?.disconnect();
		window.history.replaceState(null, '', '/');
		window.location.reload();
	}

	const activateNotif = () =>  {
		setShowActivateNotif(!showActivateNotif);
	}

	const disableNotif = () => {
		setNewNotifications(false);
	}

	const loadNotifications = async() => {

		const response = await fetch(`${process.env.API_URL}/users/getPendingFriends`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			},
		});
		if (response.ok) {
			const notify = await response.json()
			if (notify)
				setNotify([...notify]);
			if (notify.length > 0)
				setNewNotifications(true);
			console.log(notify)
		}
		else {
			const error = await response.json();
			if (Array.isArray(error.message))
				toast.warn(error.message[0]);
			else
				toast.warn(error.message);
		}
	}

	const handleFriendshipAccept = async (friendUsername: string) => {
	
		const friendRequestDto = {
			recipientLogin: friendUsername,
		}

		const response = await fetch(`${process.env.API_URL}/users/acceptFriendRequest`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
			},
			body: JSON.stringify(friendRequestDto),
		});

		if (response.ok) {
			const data = await response.json();
			if (globalState.userSocket?.connected) {
				globalState.userSocket?.emit('friendRequestAccepted', {
					roomName: data.name,
					roomID: data.id,
					initiator:  friendUsername,
					recipient: sessionStorage.getItem("currentUserLogin"),
				});
				globalState.userSocket?.emit('joinRoom', {
					roomName: data.name,
					roomID: data.id,
				});
			}
			setReloadNotifications(true);
		}
		else {
			const error = await response.json();
			if (Array.isArray(error.message))
				toast.warn(error.message[0]);
			else
				toast.warn(error.message);
		}
	}

	const handleFriendshipDeny = async (friendID: number, friendUsername: string) => {

		const deleteFriendRequestDto = {
			friendID: friendID,
		}

		const response = await fetch(`${process.env.API_URL}/users/deleteFriendRequest`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
			},
			body: JSON.stringify(deleteFriendRequestDto),
		})

		if (response.ok) {
			chatDispatch({ type: 'TOGGLEX', payload: 'refreshFriendsList' });

			setReloadNotifications(true);
		}
		else {
			const error = await response.json();
			if (Array.isArray(error.message))
				toast.warn(error.message[0]);
			else
				toast.warn(error.message);
		}
		return ;
	}

	useEffect(() => {
		uploadAvatar();
	}, [globalState.showRefresh]);

	// reload sur changement de username
	useEffect(() => {
		loadNotifications();
	}, [reloadNotifications]);

	useEffect(() => {

		globalState.userSocket?.on('refreshHeaderNotif', () => {
			loadNotifications();
		});

		return () => {
			globalState.userSocket?.off('refreshHeaderNotif');
		}

	}, [globalState?.userSocket]);

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
		<div className="bloc-logout">
			<button className="button-logout" onClick={() => handleLogout()}></button>
		</div>
		<div className="bloc-pong">PINGPON</div>
		<button className="button-notifications" onClick={() => {activateNotif(); disableNotif();}}>
				<div className="notification-icon-container">
					<img className="notifications-icon" src='./notification.png' alt="Notifications" />
					{newNotifications && <div className="notification-badge">{notify.length}</div>}
				</div>
				{showActivateNotif && (
					<div className='notif-window'>
					{notify.map((notif: FriendShip) => (
						<div className='notif' key={notif.id}>
						<div className='notif-username'>{notif.username} veut être ton ami </div>
						<button className='notif-accept' onClick={() => {handleFriendshipAccept(notif.username)}}>Accept</button>
						<button className='notif-decline' onClick={() => {handleFriendshipDeny(notif.id, notif.username)}}>Decline</button>
						</div>
					))}
					</div>
				)}
		</button>
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
