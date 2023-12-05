import './FriendsListTab.css'
import React, { useState } from 'react';
import ConfirmationComponent from '../../confirmation/Confirmation';

const FriendsListTabComponent: React.FC<{ user: string }> = ({ user }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleTabClick = (text: string) => {
    setConfirmationText(text);
    setShowConfirmation(true);
  };

  return (
	<>
		<div className="bloc-tab">
		<button className='tab1'/>
		<button className='tab2' onClick={() => handleTabClick(`Etes vous sur de vouloir défier ${user} ?`)} />
		<button className='tab3' onClick={() => handleTabClick(`Etes vous sur de vouloir ajouter ${user} a votre channel ?`)} />
		<button className='tab4'/>
		<button className='tab5' onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${user} ?`)}/>
		
		</div>
		{showConfirmation && (
		<ConfirmationComponent phrase={confirmationText}/>
		)}
	</>
  );
}

export default FriendsListTabComponent;

