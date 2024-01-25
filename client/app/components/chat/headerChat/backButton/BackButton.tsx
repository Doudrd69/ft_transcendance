import './BackButton.css'
import React from 'react';
import {useChat} from '../../ChatContext'
import { useEffect } from 'react';
const BackButtonComponent: React.FC = () => {

	const { chatState, chatDispatch } = useChat();
	const handleCancel = () => {
			chatDispatch({ type: 'DISABLE', payload: 'showChat' });
			chatDispatch({ type: 'DISABLE', payload: 'showChannel' });
			chatDispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
			chatDispatch({ type: 'DISABLE', payload: 'showOptionsChannel' });
			chatDispatch({ type: 'ACTIVATE', payload: chatState.currentComponent });
	};


	useEffect(() => {
			const handleEscape = (event: KeyboardEvent) => {
				if (event.key === 'Escape' ) {
					handleCancel();
				}
			};
	
			document.addEventListener('keydown', handleEscape);
			return () => {
				document.removeEventListener('keydown', handleEscape);
			};
	}, []);

	return  (
		<img
		  className="back-button"
		  src="./closeblack.png"
		  onClick={() => {
			handleCancel();
		  }}
		  alt="Back Button"
		/>
	  );
};
export default BackButtonComponent;
