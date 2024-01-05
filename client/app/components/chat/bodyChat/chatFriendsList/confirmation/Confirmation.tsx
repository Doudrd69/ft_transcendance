import './Confirmation.css'
import React from 'react';
import { useChat } from '../../../ChatContext';

interface ConfirmationComponentProps {
	phrase: string;
}
  
const ConfirmationComponent: React.FC<ConfirmationComponentProps> = ({ phrase }) => {
	const {state, dispatch} = useChat();
	return (
	<div className='blur-background'>
	  <div className='bloc-confirmation'>
		<div>
			<p className='sentence'>{phrase}</p>
			<div className='yes-no'>
				<button className='yes'>YES</button>
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