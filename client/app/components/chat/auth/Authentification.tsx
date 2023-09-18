import './Authentification.css'
import React from 'react'

const Authentificationcomponent: React.Fc = () => {
  return (
	<div className="block-auth">
		<a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-4d0db0aeaaddb9bee1f99f2e27a7fee7a501130aa05cb3cffe2caf30e50418be&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code">
			<button className= "button-auth">Se connecter avec 42</button>
		</a>
	</div>
  )
};
	export default Authentificationcomponent