import './BackButton.css'
import React from 'react';
import {useChat} from '../../ChatContext'
import { useEffect } from 'react';
const BackButtonComponent: React.FC = () => {

	const { state, dispatch } = useChat();
	const handleCancel = () => {
			console.log("MEEEEEEEEEEEEEEEEEEEEEEE");
			dispatch({ type: 'DISABLE', payload: 'showChat' });
			dispatch({ type: 'DISABLE', payload: 'showChannel' });
			dispatch({ type: 'DISABLE', payload: 'showOptionsUserChannel' });
			dispatch({ type: 'DISABLE', payload: 'showOptionsChannel' });
			dispatch({ type: 'ACTIVATE', payload: state.currentComponent });
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