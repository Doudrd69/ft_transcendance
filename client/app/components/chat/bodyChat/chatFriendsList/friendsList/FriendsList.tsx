import './FriendsList.css'
import React, { useState, useEffect } from 'react'
import FriendsListTabComponent from './friendsListTab/FriendsListTab';

interface FriendShip {
	id: number;
	isAccepted: true;
	friend: any;
}

const FriendsListComponent: React.FC = () => {

	const [showTabFriendsList, setTabFriendsList] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [friendList, setFriendList] = useState<FriendShip[]>([]);
	const username = sessionStorage.getItem("currentUserLogin");

	const disableTabFriendsList = () =>setTabFriendsList(false);
	const activateTabFriendsList = (index: number) => {
		if (activeIndex === index) {
		  // Si le bouton actif est cliqué à nouveau, désactivez-le
		  setActiveIndex(null);
		} else {
		  // Sinon, activez le bouton cliqué et désactivez les autres
		  setActiveIndex(index);
		}
	};

	const loadFriendList = async () => {

		const response = await fetch(`http://localhost:3001/users/getFriends/${username}`, {
			method: 'GET',
		});

		// erreur : celui qui a accepte n'a pas le user dans sa list
		if (response.ok) {
			const data = await response.json();
			console.log("DATA checck ==> ", data);
			// setFriendList((prevFriendList: FriendShip[]) => [...prevFriendList, ...data]);
			setFriendList([...data]);
		}
		else {
			console.log("Fatal error: no friend list");
		}
	}
	
	const userData = {
		discussion: friendList,
		online:[
			"on",
			"off",
			"on",
			"on",
			"off",
			"on",
			"on",
		]
	};

	useEffect(() => {
		console.log("FriendList in useEffect: ", friendList);
	  }, [friendList]);

	useEffect(() => {
		console.log("Loading friend list...");
		loadFriendList();
	}, []);

	return (
		<div className="bloc-friendslist">
		  {userData.discussion.map((friend: FriendShip, id: number) => (
			<div className='tab-and-userclicked' key={id}>
			  <div className ='bloc-button-friendslist'>
				<div className={`profil-friendslist ${userData.online[id]}`}/>
				<div className={`amies ${activeIndex === id? 'active' : ''}`} onClick={() => activateTabFriendsList(id)}>
					{friend.friend.login}
				</div>
			  </div>
			  {activeIndex === id && <FriendsListTabComponent user={friend.friend.login} />}
			</div>
		  ))}
		</div>
	)
	// return (
	// 	<div className="bloc-friendslist">
	// 		{userData.discussion.map((user, index) => (
	// 			<div className='tab-and-userclicked'>
	// 				<div className ='bloc-button-friendslist'>
	// 					<div className={`profil-friendslist ${userData.online[index]}`}/>
	// 					<div className={`amies ${activeIndex === index ? 'active' : ''}`} onClick={() => activateTabFriendsList(index)}>
	// 						{user}
	// 					</div>
	// 				</div>
	// 				{activeIndex === index && <FriendsListTabComponent user={user}/>}
	// 			</div>
	// 		))}
	// 	</div>
	// )
}

export default FriendsListComponent;