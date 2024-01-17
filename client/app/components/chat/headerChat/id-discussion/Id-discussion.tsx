import './Id-discussion.css'
import React, { use ,  useEffect, useState} from 'react';
import { useChat } from '../../ChatContext';
import OptionsChannel from '../../bodyChat/addConversation/OptionsChannel';
import { Socket } from 'socket.io-client';
import PasswordChangeComponent from './PasswordChange';

const IdDiscussionComponent: React.FC = () => {

	const { state, dispatch } = useChat();
	var id;

	if (state.currentChannelBool)
	{
		id = `${state.currentConversation}#${state.currentConversationID}`;
	}
	else
		id = state.currentConversation;

	return (
		<div className='bloc-id'>
			<p className="id">{id}</p>
			{state.currentIsAdmin &&
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