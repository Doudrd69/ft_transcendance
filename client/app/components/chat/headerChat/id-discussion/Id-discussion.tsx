import './Id-discussion.css'
import React from 'react';
import { useChat } from '../../ChatContext';

interface IdDiscussionComponentProps {
	channel: boolean;
}
const IdDiscussionComponent: React.FC<IdDiscussionComponentProps>= () => {
	const { state } = useChat();
	return (
		
		<p className="id">{state.currentConversation}</p>
	)
};
export default IdDiscussionComponent;