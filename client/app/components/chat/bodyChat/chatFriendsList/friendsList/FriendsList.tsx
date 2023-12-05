import './FriendsList.css'
import React, {useState} from 'react'
import FriendsListTabComponent from './friendsListTab/FriendsListTab';

const FriendsListComponent: React.FC = () => {
	const [showTabFriendsList, setTabFriendsList] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

	const userData = {
		discussion: [
		  "Frederic Monachon",
		  "Eowyn Percetcheveux",
		  "Edouard Brodeur",
		  "Zoe Roffi",
		  "Jean du Jardinage",
		  "Xavier Ni elle ni moi",
		  "WiNi Monachon"
		],
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
	return (
		<div className="bloc-friendslist">
			{userData.discussion.map((user, index) => (
				<div className='tab-and-userclicked'>
					<div className ='bloc-button-friendslist'>
						<div className={`profil-friendslist ${userData.online[index]}`}/>
						<div className={`amies ${activeIndex === index ? 'active' : ''}`} onClick={() => activateTabFriendsList(index)}>
							{user}
						</div>
					</div>
					{activeIndex === index && <FriendsListTabComponent user={user}/>}
				</div>
			))}
		</div>
	)
}

export default FriendsListComponent;