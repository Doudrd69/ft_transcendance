import { useState } from "react";

const LoginView = () => {

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleLogin = async (e) => {

		e.preventDefault();

		const response = await fetch("http://localhost:3001/auth/login", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({username, password}),
		});

		if (response.ok) {
			const data = await response.json(); // Parse the response JSON
			console.log("Returned JWT: ", data.access_token); // Access the access_token
			sessionStorage.setItem("jwt", data.access_token);
			console.log("Login OK");
			alert("Vous êtes connecté!");
		}
		else {
			console.log("NEGATIVE RESPONSE");
			alert("Mot de passe incorrect");
		}
	}

	const getProfile = async (e) => {

		e.preventDefault();

		const token = sessionStorage.getItem("jwt");
		const token_string = "Bearer " + token;
		const response = await fetch("http://localhost:3001/auth/profile", {
			method: 'GET',
			headers: {
				'Authorization': token_string,
			},
		});

		if (response.ok) {
			const data = await response.json();
			console.log("Response: ", data);
			alert("Bienvenue!");
		} else {
			alert("Authentification failed");
		}
	}

	return (
		<div className='loginPage'>

			<form onSubmit={handleLogin}>
			<h1>Connexion</h1>

				<div className="Inputs">
					<input
						type="text"
						placeholder="Pseudo"
						value={username}
						onChange={(e) => setUsername(e.target.value)}>
					</input>
					<input
						type="text"
						placeholder="Mot de passe"
						value={password}
						onChange={(e) => setPassword(e.target.value)}>
					</input>
					<button type="submit">Se connecter</button>
				</div>

				<p>
					Pas encore inscrit?
				</p>
			</form>

			<form onSubmit={getProfile}>
				<button type="submit">Profile</button>
			</form>

			<div className="420Auth">
				<a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-4d0db0aeaaddb9bee1f99f2e27a7fee7a501130aa05cb3cffe2caf30e50418be&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code">
					<button>Se connecter avec 42</button>
				</a>
			</div>

		</div>
	)
};

	export default LoginView;