import './BackButton.css'
import React from 'react';
import {useChat} from '../../ChatContext'
const BackButtonComponent: React.FC = () => {

	const { state, dispatch } = useChat();
	return (
				<button className="back-button"
					onClick={() => dispatch({ type: 'TOGGLE', payload: 'showDiscussionList' })}>
				</button>
	)
};
export default BackButtonComponent;