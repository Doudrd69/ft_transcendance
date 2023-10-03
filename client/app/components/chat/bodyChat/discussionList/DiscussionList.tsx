import './DiscussionList.css'
import React from 'react';
import {useChat} from '../../ChatContext'

const DiscussionListComponent: React.FC = () => {

	// const retreiveUser = async () => {
	// 	const response = await fetch("http://localhost:3001/getUser", {
	// 		method : 'GET',
	// 		headers:{
	// 			'Authorization':,
	// 		},
	// 	});
	// }
	// if (response.ok){
	// 	const userData = await Response.json();
	// 	userData.login();
	// }
	const {handleChatDiscussion} = useChat();
	const userData = {
		discussion: [
			"Eowyn Percetcheveux",
			"Edouard Brodeur",
			"Zoe Roffi",
			"Frederic Monachon",
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
		<div className="bloc-discussion-list">
			{userData.discussion.map((user, index) => (
			<div className = "bloc-button-discussion-list">
				<div className={`profil-discussion-list ${userData.online[index]}`}/>
				<button className="discussion-list" onClick={handleChatDiscussion}>
					{user}
				</button>
			</div>
			))}
		</div>
	)
};
export default DiscussionListComponent;