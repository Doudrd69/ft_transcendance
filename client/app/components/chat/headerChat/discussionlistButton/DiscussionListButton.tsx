import './DiscussionListButton.css'
import React,  {useState} from 'react';
import { useChat } from '../../ChatContext';

const DiscussionListButtonComponent: React.FC = () => {

	const {showDiscussionList, handleDiscussionList} = useChat();
		return (
		<button  className={`main-button-discussion ${showDiscussionList ? 'clicked' : ''}`} onClick={handleDiscussionList}>discussion</button>
	)
};
export default DiscussionListButtonComponent;