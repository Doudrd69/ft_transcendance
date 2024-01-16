import './Id-discussion.css'
import React, { use ,  useEffect, useState} from 'react';
import { useChat } from '../../ChatContext';
import OptionsChannel from '../../bodyChat/addConversation/OptionsChannel';
import { Socket } from 'socket.io-client';
import PasswordChangeComponent from './PasswordChange';

interface IdDiscussionProps {
	userSocket: Socket;
	}

const IdDiscussionComponent: React.FC<IdDiscussionProps>= ({ userSocket }) => {
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
			<img
				className='image-id'
				src='settings.png'
				onClick={() => { 
					dispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
					dispatch({ type: 'ACTIVATE', payload: 'showOptionChannel' });
					dispatch({ type: 'DISABLE', payload: 'showBackComponent' });
				}}
			/>
			{state.showPasswordChange && <PasswordChangeComponent userSocket={userSocket}/>}
			{state.showOptionChannel && <OptionsChannel title="CHANNEL OPTION"/>}
		</div>
		);
};
export default IdDiscussionComponent;