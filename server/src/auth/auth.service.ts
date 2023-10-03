import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/users.entity';
import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcrypt'

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
				'lastname': responseContent.last_name,
				'image': responseContent.image,
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

	async getAccessToken(code: any) {

		const data = new URLSearchParams();
		data.append('grant_type', 'authorization_code');
		data.append('client_id', 'u-s4t2ud-4d0db0aeaaddb9bee1f99f2e27a7fee7a501130aa05cb3cffe2caf30e50418be');
		data.append('client_secret', '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');
		data.append('code', code);
		data.append('redirect_uri', 'http://localhost:3000/');

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
					const payload = { sub: result.id, login: result.login };
					return { access_token: await this.jwtService.signAsync(payload) };
				} else {
					console.log("Unexpected result: ", result);
				}
			} catch (error) {
				console.log("Error in getAccessToken: ", error);
			}
		}
		else {
			console.log("Request to 42 API failed");
		}
	}
}
