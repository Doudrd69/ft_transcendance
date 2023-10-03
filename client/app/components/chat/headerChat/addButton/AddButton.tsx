import './AddButton.css'
import React from 'react';
import { useChat } from '../../ChatContext';

const AddComponent: React.FC = () => {
	const {showAdd, handleAdd} = useChat();
	return (
			<button className={`add-button ${showAdd ? 'clicked' : ''}`} onClick={handleAdd}>+</button>
	)
};
export default AddComponent;