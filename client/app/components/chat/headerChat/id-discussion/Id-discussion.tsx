import './Id-discussion.css'
import React, { use ,  useEffect, useState} from 'react';
import { useChat } from '../../ChatContext';
import OptionsChannel from '../../bodyChat/addConversation/OptionsChannel';


const IdDiscussionComponent: React.FC= () => {
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
			  {state.showAdmin && (
				<img
				  className='image-id'
				  src='settings.png'
				  onClick={() => { dispatch({ type: 'ACTIVATE', payload: 'showOptionChannel' }); }}
				/>
			  )}
			  {state.showOptionChannel && <OptionsChannel title="CHANNEL OPTION" />}
			</div>
		  );
};
export default IdDiscussionComponent;