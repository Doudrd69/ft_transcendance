import './FriendsList.css'
import React, { useState, useEffect, use } from 'react'
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
	const [activeIndexAll, setActiveIndexAll] = useState<number | null>(null);

	const [friendList, setFriendList] = useState<FriendShip[]>([]);
	const username = sessionStorage.getItem("currentUserLogin");
	const [searchValue, setSearchValue] = useState<string>('');
	const [allList, setAllList] = useState<FriendShip[]>([]);

	const disableTabFriendsList = () => setTabFriendsList(false);

	const activateTabFriendsList = (index: number, all:boolean) => {
		if (!all) {
			if (activeIndex === index) {
			  setActiveIndex(null);
			} else {
			  setActiveIndex(index);
			  setActiveIndexAll(null);
			}
		  } else { // Utiliser else ici au lieu de la condition identique (!all)
			if (activeIndexAll === index) {
			  setActiveIndexAll(null);
			} else {
			  setActiveIndexAll(index);
			  setActiveIndex(null);
			}
		}
	};
	
	const handleSearchChange = (searchValue:string) => {
		setSearchValue(searchValue);
	};

	const loadAllList = async () => {
		try {
			const response = await fetch(`${process.env.API_URL}/users/getUserList`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				}
			});
			if (response.ok) {
				const friends = await response.json();
				setAllList([...friends]);
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
		loadAllList();
	},[]);

	useEffect(() => {

		globalState.userSocket?.on('newUser', () => {
			loadAllList();
		});

		globalState.userSocket?.on('friendRequestAcceptedNotif', () => {
			loadFriendList();
		});

		globalState.userSocket?.on('refreshFriends', () => {
			loadFriendList();
		});

		globalState.userSocket?.on('refreshUserOnlineState', (notif: string) => {
			console.log("Friend online status event (FriendList.tsx) --> ", notif);
			loadFriendList();
		});

		globalState.userSocket?.on('refreshGlobalUserList', () => {
			loadAllList();
		});

		return () => {
			globalState.userSocket?.off('friendRequestAcceptedNotif');
			globalState.userSocket?.off('refreshFriends');
			globalState.userSocket?.off('refreshUserOnlineState');
			globalState.userSocket?.off('newUser');
		}

	}, [globalState?.userSocket]);

	const timestamp = new Date().getTime();

	return (
		<div className='bloc-friendslist-all'>
			<div className="bloc-friendslist">
				{chatState.showAddFriend && <AddFriendComponent updateFriends={loadFriendList} title="ADD NEW FRIEND"/>}
				{friendList.map((friend: FriendShip, id: number) => (
					<div className="tab-and-userclicked" key={id}>
						<div className="bloc-button-friendslist">
								<img
									src={`${process.env.API_URL}/users/getAvatar/${friend.id}/${timestamp}`}
									className={`profil-friendslist`}
									alt="User Avatar"
								/>
								<div className="amies" onClick={() => activateTabFriendsList(id, false)}>
									{friend.onlineStatus ? 
										<div className="online" />
										:
										<div className="offline" />
									}
									{friend.username}
								</div>
						</div>
						{activeIndex === id && <FriendsListTabComponent user={friend} all={false}/>}
					</div>
				))}
			</div>

			<div className="bloc-all">
				<div className="search-bar">
					<input
						type="text"
						placeholder="Rechercher des amis..."
						className="search-input"
						onChange={(e) => handleSearchChange(e.target.value)}
					/>
				</div>
				<div className='scroll-all'>
				{allList.map((friend: FriendShip, id: number) => (
					(!searchValue || friend.username.toLowerCase().includes(searchValue.toLowerCase())) && (
						<div className="tab-and-userclicked" key={id}>
						<div className="bloc-button-friendslist">
							<img
							src={`${process.env.API_URL}/users/getAvatar/${friend.id}/${timestamp}`}
							className={`profil-friendslist`}
							alt="User Avatar"
							/>
							<div className="amies" onClick={() => activateTabFriendsList(id, true)}>
							{friend.username}
							</div>
						</div>
						{activeIndexAll === id && <FriendsListTabComponent user={friend} all={true}/>}
						</div>
					)
					
				))}
				</div>
			</div>
			
		</div>
	) 
}

export default FriendsListComponent;