import './Id-discussion.css'
import React, { use ,  useEffect, useState} from 'react';
import { useChat } from '../../ChatContext';
import OptionsChannel from '../../bodyChat/addConversation/OptionsChannel';
import { Socket } from 'socket.io-client';
import PasswordChangeComponent from './PasswordChange';

const IdDiscussionComponent: React.FC = () => {
	const { state, dispatch } = useChat();
	var id;
	const meChannel = state.currentUserChannel;
	const meDm = state.targetUser;
	if (state.currentChannelBool)
	{
		id = `${state.currentChannel?.name}#${state.currentChannel?.id}`;
	}
	else
		id = state.targetUser?.username;
	 	// id= "cocou";
	return (
		<div className='bloc-id'>
			<p className="id">{id}</p>
			{state.currentUserChannel?.isAdmin &&
				<img
					className='image-id'
					src='settings.png'
					onClick={() => { 
						dispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
						dispatch({ type: 'ACTIVATE', payload: 'showOptionChannel' });
						dispatch({ type: 'DISABLE', payload: 'showBackComponent' });
					}}
				/>
			}
			{state.showPasswordChange && <PasswordChangeComponent />}
			{state.showOptionChannel && <OptionsChannel title="CHANNEL OPTION"/>}
		</div>
		);
};
export default IdDiscussionComponent;