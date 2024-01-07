import './Id-discussion.css'
import React, { use ,  useEffect, useState} from 'react';
import { useChat } from '../../ChatContext';


const IdDiscussionComponent: React.FC= () => {
	const { state } = useChat();
	const [conversationName, setConversationName] = useState <string | null> ('');
	const parseName = (name: string | null): string | null => {
		console.log('currentConversationName ==> id ', state.currentConversationName);
		console.log("name ==> ", name);
		if (name)
		{
			if (name.endsWith("#"))
				return name.slice(0, -1);
			else {
				const currentUserLogin = sessionStorage.getItem("currentUserLogin");
				const conversationNameWithoutCurrentUser = name.replace(currentUserLogin!, '').trim()
				const modifiedName = conversationNameWithoutCurrentUser.slice();
				return modifiedName;
			}
		}
		return null;
	};
	
	return (
		
		<p className="id">{parseName(state.currentConversationName)}</p>
	)
};
export default IdDiscussionComponent;