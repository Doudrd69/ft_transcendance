import './AddButton.css'
import React from 'react';
import { useChat } from '../../ChatContext';

const AddComponent: React.FC = () => {
	const { chatState, chatDispatch } = useChat();
	return (
			<button className={`add-button ${chatState.showAdd ? 'clicked' : ''}`} 
			onClick={() => chatDispatch({ type: 'TOGGLE', payload: 'showAdd' })}>+</button>
	)
};
export default AddComponent;