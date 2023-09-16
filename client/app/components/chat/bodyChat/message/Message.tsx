import './Message.css'
import React from 'react';

const MessageComponent: React.FC = () => {

	return (
			<div className="bloc-message">
				<textarea className="message" placeholder="message..."></textarea>
				<button className="buttom-message"></button>
			</div>	
	)
};
export default MessageComponent;