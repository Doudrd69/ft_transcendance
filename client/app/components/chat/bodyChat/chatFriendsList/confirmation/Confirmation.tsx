import './Confirmation.css'
import React from 'react';
import { useChat } from '../../../ChatContext';

interface ConfirmationComponentProps {
	phrase: string;
	functionToExecute: () => void;
}
  
const ConfirmationComponent: React.FC<ConfirmationComponentProps> = ({ phrase, functionToExecute }) => {
	const {state, dispatch} = useChat();
	return (
	<div className='blur-background'>
	  <div className='bloc-confirmation'>
		<div>
			<p className='sentence'>{phrase}</p>
			<div className='yes-no'>
				<button className='yes' onClick={functionToExecute}>YES</button>
				<button className='no'onClick={() =>
					dispatch({ type: 'DISABLE', payload: 'showConfirmation' })
					}>
					NO
				</button>
			</div>
		</div>
	  </div>
	</div>
	);
  };
  
export default ConfirmationComponent;