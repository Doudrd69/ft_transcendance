import './Id-discussion.css'
import React, { use ,  useEffect, useState} from 'react';
import { useChat } from '../../ChatContext';


const IdDiscussionComponent: React.FC= () => {
	const { state } = useChat();
	
	return (
		
		<p className="id">{state.currentConversation}</p>
	)
};
export default IdDiscussionComponent;