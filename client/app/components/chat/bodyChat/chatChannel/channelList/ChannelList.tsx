import './ChannelList.css';
import React, { useState, useEffect } from 'react';
import {useChat, setCurrentChannelUserList, setCurrentComponent, setCurrentChannel, setCurrentUserChannel } from '../../../ChatContext';
import AddConversationComponent from '../../addConversation/AddConversation';
import { Socket } from 'socket.io-client';
import ListMyChannelComponent from '../../listMyChannel/ListMyChannel';
import PasswordComponent from '../../listMyChannel/Password';
import { Channel, ConversationChannel, ConversationDm, UserChannel, UserDm } from '../../../types';


const ChannelListComponent: React.FC = () => {

	const { state, dispatch } = useChat();
	const [currentChannelState, setCurrentChannelState] = useState<ConversationChannel | null>(null);
	const userID = Number(sessionStorage.getItem("currentUserID"));
	const userName = sessionStorage.getItem("currentUserLogin")


	const loadDiscussions = async () => {
		try{

			const response = await fetch(`http://localhost:3001/chat/getConversations/${userID}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				}
			});
			if (response.ok) {
				const channelList = await response.json();
				dispatch({ type: 'SET_CHANNEL_LIST', payload: channelList});
			}
		}
		catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		console.log("Loading conversations...");
		loadDiscussions();

	}, [state.refreshChannel]);

	const handleCloseAddCreate = () => {
		dispatch({ type: 'DISABLE', payload: 'showAddCreateChannel' });
	};

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				handleCloseAddCreate();
			}
		};
		
			document.addEventListener('keydown', handleEscape);
			return () => {
			  document.removeEventListener('keydown', handleEscape);
			};
	}, []);

	const loadUserList = async (channel: ConversationChannel) => {
		try {
		  if (channel && channel.id) {
			const response = await fetch(`http://localhost:3001/chat/getUserList/${channel.id}`, {
			  method: 'GET',
			  headers: {
				'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
			  },
			});
	  
			if (response.ok) {
				const userList = await response.json();
				await dispatch(setCurrentChannelUserList(userList));
			}
		  }
		} catch (error) {
		  console.log(error);
		}
	}
	useEffect(() => {
		if (currentChannelState) {
			handleConv(currentChannelS);
		}
	},[currentChannel]);

	const handleConv = async (channel: ConversationChannel) => {
		/* NEW */
		console.log("Channel: ", channel);
		if (channel)
			dispatch(setCurrentChannel(channel));
		await loadUserList(channel);
		console.log("state.current: ", state.currentChannel);
		const me = Array.isArray(state.currentChannelUserList) ? state.currentChannelUserList.find((user: UserChannel) => user.username ===  sessionStorage.getItem("currentUserLogin")) : null;
		if (me)
			dispatch(setCurrentUserChannel(me));
		dispatch(setCurrentComponent('showChannelList'));
		dispatch({ type: 'ACTIVATE', payload: 'showChannel' });
		dispatch({ type: 'DISABLE', payload: 'showChannelList' });
		dispatch({ type: 'ACTIVATE', payload: 'currentChannelBool' });
	};
	

	return (
		<div className="bloc-channel-list">
			<button
				className={`button-channel-list-add ${state.showAddCreateChannel ? 'green-border' : ''}`}
				onClick={() => {
				dispatch({ type: 'ACTIVATE', payload: 'showAddCreateChannel' });
				}}
			>
				+
			</button>
			<div className='create-add'>
				{ state.showAddCreateChannel ?
					<div className='blur'>
						<img className="add_button_cancel" src='./close.png'  onClick={handleCloseAddCreate}/>
						<div className='bloc-add-create'>
							<button className='button-add' onClick= {() => {dispatch({type:'ACTIVATE', payload: 'showCreateChannel'})}}>
								CREATE
							</button>
							<button className='button-add' onClick= {() => {dispatch({type:'ACTIVATE', payload: 'showAddChannel'})}}>
								JOIN 
							</button>
						</div>
					</div>
					: null}
				{state.showPassword ? <PasswordComponent /> : null}
				{state.showAddChannel ? <ListMyChannelComponent user={userName || 'no-user'} isAdd={true} title="JOIN CHANNEL"/> : null}
				{state.showCreateChannel ? <AddConversationComponent loadDiscussions={loadDiscussions} title="CREATE CHANNEL" isChannel={true} /> : null}
			</div>
			{state.channelList && state.channelList?.map((channel:Channel, index:number) => (
					channel.conversation.is_channel && (
					<button
						key={index}
						className="button-channel-list"
						onClick={() => setCurrentChannel(channel.conversation)}
					>
					{channel.isAdmin && <img className="icon-admin-channel" src='./crown.png' alt="private" />}
					{channel.conversation.id &&  <img className="icon-password-channel" src='./password.png' alt="private" />}
					{!channel.conversation.isPublic && <img className="icon-private-channel" src='./private.png' alt="private" />}
					<span>{`${channel.conversation.name}#${channel.conversation.id}`}</span>
				</button>
				)
			))}
		</div>
	);
};

export default ChannelListComponent;
