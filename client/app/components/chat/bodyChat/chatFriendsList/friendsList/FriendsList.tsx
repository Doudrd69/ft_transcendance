import './FriendsList.css'
import React, { useState, useEffect } from 'react'
import FriendsListTabComponent from './friendsListTab/FriendsListTab';
import { useChat } from '../../../ChatContext';
import AddFriendComponent from '../../addConversation/AddFriends';
import { Socket } from 'socket.io-client';
import AvatarImageComponent from '@/app/components/Avatar/Avatar';
import { useGlobal } from '@/app/GlobalContext';
import { toast } from 'react-toastify';

interface FriendShip {
	id: number;
	username: string;
	isBlocked: boolean;
	onlineStatus: boolean;
}

interface Conversation {
	id: string,
	name: string;
	is_channel:boolean;
}

const FriendsListComponent: React.FC = () => {
	
	const { chatState, chatDispatch } = useChat();
	const { globalState } = useGlobal();
	const [showTabFriendsList, setTabFriendsList] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [friendList, setFriendList] = useState<FriendShip[]>([]);
	const username = sessionStorage.getItem("currentUserLogin");

	const disableTabFriendsList = () => setTabFriendsList(false);

	const activateTabFriendsList = (index: number) => {
		if (activeIndex === index) {
		  setActiveIndex(null);
		} else {
		  setActiveIndex(index);
		}
	};
	
	const loadFriendList = async () => {
		try {
			const response = await fetch(`${process.env.API_URL}/users/getFriends`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				}
			});
			if (response.ok) {
				const friends = await response.json();
				setFriendList([...friends]);
			}
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		loadFriendList();
	}, [chatState.refreshFriendsList]);

	useEffect(() => {

		globalState.userSocket?.on('friendRequestAcceptedNotif', () => {
			loadFriendList();
		});

		globalState.userSocket?.on('refreshFriends', () => {
			loadFriendList();
		});

		globalState.userSocket?.on('newConnection', (notif: string) => {
			loadFriendList();
		})

		globalState.userSocket?.on('newDeconnection', (notif: string) => {
			loadFriendList();
		})

		return () => {
			globalState.userSocket?.off('friendRequestAcceptedNotif');
			globalState.userSocket?.off('refreshFriends');
			globalState.userSocket?.off('newConnection');
			globalState.userSocket?.off('newDeconnection');
		}

	}, [globalState?.userSocket]);

	const timestamp = new Date().getTime();

	return (
		<div className="bloc-friendslist">
			<button
				className="button-friends-list-add"
				onClick={() => {
				chatDispatch({ type: 'ACTIVATE', payload: 'showAddFriend' });
			}}
			>
			+
			</button>
			{chatState.showAddFriend && <AddFriendComponent updateFriends={loadFriendList} title="ADD NEW FRIEND"/>}
			{friendList.map((friend: FriendShip, id: number) => (
			<div className="tab-and-userclicked" key={id}>
				<div className="bloc-button-friendslist">
						<img
							src={`${process.env.API_URL}/users/getAvatar/${friend.id}/${timestamp}`}
							className={`profil-friendslist`}
							alt="User Avatar"
						/>
						<div className="amies" onClick={() => activateTabFriendsList(id)}>
							{friend.onlineStatus ? 
								<div className="online" />
								:
								<div className="offline" />
							}
							{friend.username}
						</div>
				</div>
				{activeIndex === id && <FriendsListTabComponent user={friend}/>}
			</div>
		  ))}
		</div>
	) 
}

export default FriendsListComponent;