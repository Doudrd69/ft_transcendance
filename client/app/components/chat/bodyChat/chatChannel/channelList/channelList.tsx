import './ChannelList.css'
import React from 'react';
import {useChat} from '../../../ChatContext'

const ChannelListComponent: React.FC = () => {

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
	const { state, dispatch } = useChat();
	const userData = {
		channel: [
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
		<div className="bloc-channel-list">
			{userData.channel.map((user, index) => (
			<div className = "bloc-button-channel-list">
				<div className={`profil-channel-list ${userData.online[index]}`}/>
				<button	className="channel-list" 
						onClick={() => dispatch({ type: 'TOGGLE', payload: 'showChannelchannel' })}>
					{user}
				</button>
			</div>
			))}
		</div>
	)
};
export default ChannelListComponent;