import './FriendsList.css'
import React, { useState, useEffect } from 'react'
import FriendsListTabComponent from './friendsListTab/FriendsListTab';
import { useChat } from '../../../ChatContext';
import AddFriendComponent from '../../addConversation/AddFriends';
import { Socket } from 'socket.io-client';


interface FriendShip {
	id: number;
	isAccepted: true;
	isActive: boolean;
	friend?: any;
	initiator?: any
}
interface FriendsListComponentProps {
	userSocket: Socket;
  }
  
const FriendsListComponent: React.FC<FriendsListComponentProps> = ({ userSocket }) => {

	const [showTabFriendsList, setTabFriendsList] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [friendList, setFriendList] = useState<FriendShip[]>([]);
	const username = sessionStorage.getItem("currentUserLogin");
	const {state, dispatch} = useChat();


	const disableTabFriendsList = () =>setTabFriendsList(false);

	const activateTabFriendsList = (index: number) => {
		if (activeIndex === index) {
		  setActiveIndex(null);
		} else {
		  setActiveIndex(index);
		}
	};
	const loadFriendList = async () => {
		
		const response = await fetch(`http://localhost:3001/users/getFriends/${username}`, {
			method: 'GET',
		});
		
		if (response.ok) {
			const data = await response.json();
			setFriendList([...data]);
		}
		else {
			console.log("Fatal error: no friend list");
		}
	}

	useEffect(() => {
		console.log("Loading friend list...");
		loadFriendList();
	}, []);

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
			{state.showAddFriend && <AddFriendComponent userSocket={userSocket} updateFriends={loadFriendList} title="Add Friend"/>}
			{friendList.map((friend: FriendShip, id: number) => (
			<div className="tab-and-userclicked" key={id}>
			  <div className="bloc-button-friendslist">
				<div className={`profil-friendslist ${friend.isActive ? 'on' : 'off'}`} />
				<div
					className={`amies ${activeIndex === id ? 'active' : ''}`}
					onClick={() => activateTabFriendsList(id)}
				>
					{friend.friend ? friend.friend.login : friend.initiator ? friend.initiator.login : 'Unknown User'}
				</div>
			  </div>
			  {activeIndex === id && <FriendsListTabComponent userSocket={userSocket} user={friend.friend ? friend.friend.login : friend.initiator ? friend.initiator.login : 'Unknown User'} />}
			</div>
		  ))}
		</div>
	) 
}

export default FriendsListComponent;