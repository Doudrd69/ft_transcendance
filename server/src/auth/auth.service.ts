import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	private async getUserInfo(accessTokenArray: any) {
		console.log("--- getUserInfo ---");
		const access_token = accessTokenArray.access_token;
		console.log("getUserInfo got the token: ", access_token);

		const token_string = "Bearer " + access_token;
		const response = await fetch("https://api.intra.42.fr/v2/me", {
			method: 'GET',
			headers: {
				'Authorization': token_string,
			},
		});

		if (response.ok) {
			const userInfo = await response.json();
			// console.log("USERINFO --> ", JSON.stringify(userInfo));
			const userDataToDB = {
				'login': userInfo.login,
				'firstname': userInfo.first_name,
				'lastname': userInfo.last_name,
				'image': userInfo.image,
			}
			console.log("INFO FOR DB --> ", JSON.stringify(userDataToDB));
			if (this.usersService.findOne(userDataToDB.login)) {
				console.log("User does not exist in DB yet");
				this.usersService.createNew42User(userDataToDB);
			}
		} else {
			throw new Error("API call to retreive userInfo failed");
		}
	}

	// async login(username: string, password: any) {
	// 	const user = await this.usersService.findOne(username);

	// 	// Check if the password match with the one hashed in our database
	// 	const match = await bcrypt.compare(password, user.password);
	// 	if (!match) {
	// 		throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
	// 	}
	// 	// user.isActive = true; I need to access the usersRepository.save
	// 	const payload = { sub: user.id, username: user.username, status: user.isActive };
	// 	return { access_token: await this.jwtService.signAsync(payload) };
	// }

	async getAccessToken(code: any) {

		const data = new URLSearchParams();
		data.append('grant_type', 'authorization_code');
		data.append('client_id', 'u-s4t2ud-4d0db0aeaaddb9bee1f99f2e27a7fee7a501130aa05cb3cffe2caf30e50418be');
		data.append('client_secret', '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');
		data.append('code', code);
		data.append('redirect_uri', 'http://localhost:3000/');

		console.log("--> " + data);

		try {
			const response = await fetch('https://api.intra.42.fr/oauth/token', {
				method: 'POST',
				body: data,
			});
		
			if (response.ok) {
				console.log("--Request to API ok--");
				const responseContent = await response.json();
				console.log('Response:',  JSON.stringify(responseContent));
				this.getUserInfo(responseContent);
			} else {
				const errorResponse = await response.json(); // Parse the JSON response
				console.log("Error:", errorResponse); // Log the parsed error response
				throw new Error("Failed API return for token");
			}
		} catch (error) {
			console.error("Fetch error:", error);
			throw error;
		}
	}
}
