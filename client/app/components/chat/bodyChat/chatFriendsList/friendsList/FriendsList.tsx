import './FriendsList.css'
import React, { useState, useEffect } from 'react'
import FriendsListTabComponent from './friendsListTab/FriendsListTab';
import { useChat } from '../../../ChatContext';
import AddFriendComponent from '../../addConversation/AddFriends';
import { Socket } from 'socket.io-client';
import AvatarImageComponent from '@/app/components/Avatar/Avatar';

interface FriendShip {
	id: number;
	username: string;
	isBlocked: boolean;
}

interface Conversation {
	id: string,
	name: string;
	is_channel:boolean;
}

const FriendsListComponent: React.FC = () => {
	
	const {state, dispatch} = useChat();
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
			const response = await fetch(`http://localhost:3001/users/getFriends/${username}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				}
			});
			if (response.ok) {
				const friends = await response.json();
				setFriendList([...friends]);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		console.log("Loading friend list...");
		loadFriendList();
	}, [state.refreshFriendList]);
	const timestamp = new Date().getTime();


	return (
		<div className="bloc-friendslist">
			<button
				className="button-friends-list-add"
				onClick={() => {
				dispatch({ type: 'ACTIVATE', payload: 'showAddFriend' });
			}}
			>
			+
			</button>
			{state.showAddFriend && <AddFriendComponent updateFriends={loadFriendList} title="ADD NEW FRIEND"/>}
			{friendList.map((friend: FriendShip, id: number) => (
				console.log(friend),
			<div className="tab-and-userclicked" key={id}>
				<div className="bloc-button-friendslist">
						<img
							src={`http://localhost:3001/users/getAvatarByLogin/${friend.username}/${timestamp}`}
							className={`profil-friendslist`}
							alt="User Avatar"
						/>
						<div className={`amies ${activeIndex === id ? 'active' : ''}`} onClick={() => activateTabFriendsList(id)}>
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