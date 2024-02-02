import './Confirmation.css'
import React, {useEffect, useState} from 'react';
import { useChat } from '../../../ChatContext';

interface ConfirmationComponentProps {
	phrase: string;
	functionToExecute: () => void;
}


const ConfirmationComponent: React.FC<ConfirmationComponentProps> = ({ phrase, functionToExecute }) => {
	const { chatState, chatDispatch } = useChat();
	const [isEnterPressed, setIsEnterPressed] = useState(false);

	useEffect(() => {
		const handleEnterKey = async (event: KeyboardEvent) => {
		  if (event.key === 'Enter') {
			try {
			  await functionToExecute();
			  handleCancel();
			} catch (error) {
			  console.error('Erreur lors de l\'exécution de la fonction :', error);
			} finally {
			  setIsEnterPressed(false);
			}
		  }
		};

		document.addEventListener('keydown', handleEnterKey);

		return () => {
		  document.removeEventListener('keydown', handleEnterKey);
		};
	  }, [isEnterPressed]);
	const handleCancel = () => {
		chatDispatch({ type: 'DISABLE', payload: 'showConfirmation' })
		chatDispatch({ type: 'ACTIVATE', payload: 'showBackComponent' });
	};

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') { 
				handleCancel();
			}
		};
		document.addEventListener('keydown', handleEscape);
		return () => {
		  document.removeEventListener('keydown', handleEscape);
		};
	}, []);
	return (
		<div className='blur-background'>
		  <img className="add_button_cancel" src='./close.png' onClick={handleCancel} />
		  <div className='bloc-confirmation'>
			<div>
			  <p className='sentence'>{phrase}</p>
			  <div className='yes-no'>
				<button
				  className='button-ok'
				  onClick={() => {
					functionToExecute();
					handleCancel();
				  }}
				>
				  OK
				</button>
			  </div>
			</div>
		  </div>
		</div>
	  );
  };
  
export default ConfirmationComponent;