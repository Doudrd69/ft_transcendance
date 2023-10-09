import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { User } from '../users/entities/users.entity'
import { JwtService } from '@nestjs/jwt'
import { speakeasy } from 'speakeasy'
import { QRCode } from 'qrcode'
import dotenv from 'dotenv';
// import * as bcrypt from 'bcrypt';

dotenv.config();

const redirectUri = process.env.SERVER_REDIRECT_URI;
const clientId = process.env.SERVER_TOKEN_CLIENT_ID;
const clientSecret = process.env.SERVER_TOKEN_CLIENT_SECRET;

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	private async getUserInfo(accessTokenArray: any): Promise<User> {
		const access_token = accessTokenArray.access_token;
		const token_string = "Bearer " + access_token;
		const response = await fetch("https://api.intra.42.fr/v2/me", {
			method: 'GET',
			headers: {
				'Authorization': token_string,
			},
		});

		if (response.ok) {
			const responseContent = await response.json();
			const userInformation = {
				'login': responseContent.login,
				'firstname': responseContent.first_name,
				'image': responseContent.image,
				'socket': 1,
			}

			const result = await this.usersService.findUserByLogin(userInformation.login);
			if (result) {
				console.log("User exists in our DB");
				return result;
			}
			else {
				return this.usersService.createNew42User(userInformation);
			}
		}
		else {
			return null; // attention ici
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

	// async handle2FA() {

	// 	const secret = speakeasy.generateSecrete();
	// 	// recup l'utilisateur et l'envoyer dans la fonction d'enregistrement du secret
	// 	this.usersService.register2FASecret(secret);
	// 	// Get the data URL of the authenticator URL
	// 	QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
	// 		console.log(data_url);
	// 		// Display this data URL to the user in an <img> tag
	// 		// return a json object with the data_url
	// 		return JSON.stringify(data_url);
	// 	});
	// 	// Then I display the QRCode to the user, he scans it, we get a code, we make a request to a server-function which will verify
	// 	// the token with the temp_secret, and if true, we save the secret.
	// }

	async getAccessToken(code: any) {

		const data = new URLSearchParams();
		console.log("TEEEEEST: ", JSON.stringify(clientId));
		data.append('grant_type', 'authorization_code');
		data.append('client_id', clientId);
		data.append('client_secret', clientSecret);
		data.append('code', code);
		data.append('redirect_uri', redirectUri);

		const response = await fetch('https://api.intra.42.fr/oauth/token', {
			method: 'POST',
			body: data,
		});

		if (response.ok) {
			console.log("-- Request to API OK --");
			const responseContent = await response.json();
			
			try {
				const result = await this.getUserInfo(responseContent);
				if (result) {
					const payload = { sub: result.id, login: result.login }; // MODIFY FOR MORE INFORMATION IN PAYLOAD
					return { access_token: await this.jwtService.signAsync(payload) };
				} else {
					console.log("Unexpected result: ", result);
				}
			} catch (error) {
				console.log("Error in getAccessToken: ", error);
			}
		}
		else {
			console.log("-- Request to API FAILED --");
		}
	}
}
