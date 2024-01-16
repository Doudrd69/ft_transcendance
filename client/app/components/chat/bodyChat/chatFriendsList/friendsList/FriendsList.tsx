import './FriendsList.css'
import React, { useState, useEffect } from 'react'
import FriendsListTabComponent from './friendsListTab/FriendsListTab';
import { useChat } from '../../../ChatContext';
import AddFriendComponent from '../../addConversation/AddFriends';
import { Socket } from 'socket.io-client';
import AvatarImageComponent from '@/app/components/Avatar/Avatar';


interface FriendShip {
	id: number;
	isAccepted: true;
	isActive: boolean;
	friend?: any;
	initiator?: any;
	roomName?: string;
	roomID?: string;
}
interface FriendsListComponentProps {
	userSocket: Socket;
}

interface Conversation {
	id: string,
	name: string;
	is_channel:boolean;
}
  
const FriendsListComponent: React.FC<FriendsListComponentProps> = ({ userSocket }) => {

	const [showTabFriendsList, setTabFriendsList] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [friendList, setFriendList] = useState<FriendShip[]>([]);
	const username = sessionStorage.getItem("currentUserLogin");
	const {state, dispatch} = useChat();

	const disableTabFriendsList = () => setTabFriendsList(false);

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
			headers: {
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			}
		});
		
		if (response.ok) {
			const friends = await response.json();

			const requestDms = await fetch(`http://localhost:3001/chat/getConversations/${sessionStorage.getItem("currentUserID")}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
			});

			if (requestDms.ok) {
				const conversations = await requestDms.json();
				const DMs = conversations.filter((conversation: Conversation) => !conversation.is_channel);

				friends.forEach((friend: FriendShip) => {
					DMs.forEach((dm: Conversation) => {
						friend.roomName = dm.name;
						friend.roomID = dm.id;
					});
				});
				setFriendList([...friends]);
			}
		}
		else {
			console.log("Fatal error");
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
			{state.showAddFriend && <AddFriendComponent userSocket={userSocket} updateFriends={loadFriendList} title="ADD NEW FRIEND"/>}
			{friendList.map((friend: FriendShip, id: number) => (
			<div className="tab-and-userclicked" key={id}>
				<div className="bloc-button-friendslist">
						<img
							src={`http://localhost:3001/users/getAvatarByLogin/${friend.friend ? friend.friend.username : friend.initiator ? friend.initiator.username : 'Unknown User'}/${timestamp}`}
							className={`profil-friendslist ${friend.isActive ? 'on' : 'off'}`}
							alt="User Avatar"
						/>
						<div className={`amies ${activeIndex === id ? 'active' : ''}`} onClick={() => activateTabFriendsList(id)}>
							{friend.friend ? friend.friend.username : friend.initiator ? friend.initiator.username : 'Unknown User'}
						</div>
				</div>
				{activeIndex === id && <FriendsListTabComponent userSocket={userSocket} userLogin={friend.friend ? friend.friend.username : friend.initiator ? friend.initiator.username : 'Unknown User'} roomName={friend.roomName}  roomID= {friend.roomID}/>}
			</div>
		  ))}
		</div>
	) 
}

export default FriendsListComponent;