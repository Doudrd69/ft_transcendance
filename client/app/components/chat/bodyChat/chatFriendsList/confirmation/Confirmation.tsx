import './Confirmation.css'
import React, {useEffect} from 'react';
import { useChat } from '../../../ChatContext';

interface ConfirmationComponentProps {
	phrase: string;
	functionToExecute: () => void;
}
  
const ConfirmationComponent: React.FC<ConfirmationComponentProps> = ({ phrase, functionToExecute }) => {
	const {state, dispatch} = useChat();

	const handleCancel = () => {
		dispatch({ type: 'DISABLE', payload: 'showConfirmation' })
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
	<img className="add_button_cancel" src='./close.png'  onClick={handleCancel}/>
	  <div className='bloc-confirmation'>
		<div>
			<p className='sentence'>{phrase}</p>
			<div className='yes-no'>
				<img className='img-enter' src="enter.png" onClick={functionToExecute}/>
			</div>
		</div>
	  </div>
	</div>
	);
  };
  
export default ConfirmationComponent;