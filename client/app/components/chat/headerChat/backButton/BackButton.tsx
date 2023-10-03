import './BackButton.css'
import React from 'react';
import {useChat} from '../../ChatContext'
const BackButtonComponent: React.FC = () => {

	const {handleDiscussionList} = useChat();
	return (
				<button className="back-button" onClick={handleDiscussionList}></button>
	)
};
export default BackButtonComponent;