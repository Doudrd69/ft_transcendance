import './Id-discussion.css'
import React, { use ,  useEffect, useState} from 'react';
import { useChat } from '../../ChatContext';
import OptionsChannel from '../../bodyChat/addConversation/OptionsChannel';
import { Socket } from 'socket.io-client';
import PasswordChangeComponent from './PasswordChange';
import { useGlobal } from '@/app/GlobalContext';


const IdDiscussionComponent: React.FC = () => {

	const { chatState, chatDispatch } = useChat();
	const { globalState } = useGlobal();;
	var id;

	useEffect(() => {
		globalState.userSocket?.on('refreshAdmin', () => {
			chatDispatch({type: 'TOGGLEX', payload: 'isAdmin' });
		});
		return () => {
			globalState.userSocket?.off('refreshAdmin');
		};
		
	}, [globalState?.userSocket]);

	if (chatState.currentChannelBool)
	{
		id = `${chatState.currentConversation}#${chatState.currentConversationID}`;
	}
	else
		id = chatState.currentConversation;

	return (
		<div className='bloc-id'>
			<p className="id">{id}</p>
			{chatState.currentChannelBool && chatState.isAdmin &&
				<img
					className='image-id'
					src='settings.png'
					onClick={() => { 
						chatDispatch({ type: 'ACTIVATE', payload: 'dontcandcel' });
						chatDispatch({ type: 'ACTIVATE', payload: 'showOptionChannel' });
						chatDispatch({ type: 'DISABLE', payload: 'showBackComponent' });
					}}
				/>
			}
			{chatState.showPasswordChange && <PasswordChangeComponent />}
			{chatState.showOptionChannel && <OptionsChannel title="CHANNEL OPTION"/>}
		</div>
		);
};
export default IdDiscussionComponent;