import './Confirmation.css'
import React from 'react';

interface ConfirmationComponentProps {
	phrase: string;
  }
  
  const ConfirmationComponent: React.FC<ConfirmationComponentProps> = ({ phrase }) => {
	return (
	  <div className='bloc-confirmation'>
		<div>
			<p className='sentence'>{phrase}</p>
			<div className='yes-no'>
				<button className='yes'>YES</button>
				<button className='no'>NO</button>
			</div>
		</div>
	  </div>
	);
  };
  
export default ConfirmationComponent;