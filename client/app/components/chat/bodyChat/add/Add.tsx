import './Add.css';
import React from 'react';

const AddComponent: React.FC = () => {
  const placeholders = ["Ajouter un ami...", "Creer un channel...", "Inviter à jouer une partie..."];

  return (
    <div className="block-main">
      {placeholders.map((placeholder, index) => (
        <div className="block-add" key={index}>
          <input className="input-add" type="text" placeholder={placeholder} />
          <button className="button-add"></button>
        </div>
      ))}
    </div>
  );
};

export default AddComponent;
