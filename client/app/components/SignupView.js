import { useState } from 'react'

function Signup() {

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleSignup = async (e) => {

		e.preventDefault();

		const response = fetch("http://localhost:3001/users/signup", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({username, password}),
		});

		if ((await response).ok) {
			alert("Inscription réussie!");
			console.log("User successfully created");
		}
		else {
			console.log("Failed to create new user");
		}
	}

	return (
		<form onSubmit={handleSignup}>
			<h1>Inscription</h1>

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
				<button type="submit">S'inscire</button>
			</div>
		</form>
	);
}

export default Signup;