import './Authentification.css'
import React from 'react'

const Authentificationcomponent: React.FC = () => {
  return (
	<div className="block-auth">
		<a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8a7a2b2fd0e4c017d37f372040ba814c255a58303468e243ff07831a8d026b50&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code">
			<button className= "button-auth">Se connecter avec 42</button>
		</a>
	</div>
  )
};
	export default Authentificationcomponent;