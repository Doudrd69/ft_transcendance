import './Authentification.css'
import React, { useState } from 'react'


const Authentificationcomponent = () => {

	const [username, setUsername] = useState('');

	const handleUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(e.target.value);
	};

	const userRegister = async (e: React.FormEvent) => {

		try{
			e.preventDefault();
	
			console.log("Username : ", username);
	
			const response = await fetch('http://localhost:3001/users/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({username}),
			});
	
			if (response.ok) {
				console.log("User successfully created");
				sessionStorage.setItem("currentUserLogin", username);
			} else {
				console.log("User creation failed");
			}
		}
		catch(error){
			console.log(error);
		}
	}

	return (
			<div className="block-auth">
				<a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8a7a2b2fd0e4c017d37f372040ba814c255a58303468e243ff07831a8d026b50&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code">
					<button className= "button-auth">SIGN IN WITH 42</button>
				</a>

				{/* <form onSubmit={userRegister}>
					<label>
					Pseudo:
						<input type="text" value={username} onChange={handleUsername} />
					</label>
					<button type="submit">Enregistrer</button>
				</form> */}
			</div>
	)
}
export default Authentificationcomponent;