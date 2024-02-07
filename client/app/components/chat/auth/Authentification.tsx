import './Authentification.css'
import React, { use, useState , useEffect} from 'react'
import { useGlobal } from '../../../GlobalContext';


const Authentificationcomponent = () => {

	const [username, setUsername] = useState('');
	const { globalState, dispatch } = useGlobal();

	// const handleUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	setUsername(e.target.value);
	// };

	// const userRegister = async (e: React.FormEvent) => {

	// 	try{
	// 		e.preventDefault();
	
	// 		const response = await fetch(`${process.env.API_URL}/users/signup`, {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 			},
	// 			body: JSON.stringify({username}),
	// 		});
	
	// 		if (response.ok) {
	// 			console.log("User successfully created");
	// 			sessionStorage.setItem("currentUserLogin", username);
	// 		}
	// 	}
	// 	catch(error){
	// 		console.log(error);
	// 	}
	// }
	//AccessNouspermet de nous diriger vers la bonne fenetre de connexion
	//ici on regarde si la 2fa est activé ou non

	return (
		
			<div className="block-auth">
				<a href={process.env.NEXT_PUBLIC_AUTH_API_URL}>
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