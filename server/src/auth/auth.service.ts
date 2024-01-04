import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { User } from '../users/entities/users.entity'
import { JwtService } from '@nestjs/jwt'
import dotenv from 'dotenv';
// import * as bcrypt from 'bcrypt';

var speakeasy = require("speakeasy");
var QRCode = require('qrcode');

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

	/**************************************************************/
	/***					AUTHENTIFICATION					***/
	/**************************************************************/

	private async getUserInfo(accessTokenArray: any): Promise<User> {

		const access_token = accessTokenArray.access_token;
		const token_string = "Bearer " + access_token;

		try {
			const response = await fetch("https://api.intra.42.fr/v2/me", {
				method: 'GET',
				headers: {
					'Authorization': token_string,
				},
			});
			
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
		} catch (error) {
			throw new Error(error);
		}
	}

	async getAccessToken(code: any) {

		const data = new URLSearchParams();
		data.append('grant_type', 'authorization_code');
		data.append('client_id', clientId);
		data.append('client_secret', clientSecret);
		data.append('code', code);
		data.append('redirect_uri', redirectUri);

		try {
			const response = await fetch('https://api.intra.42.fr/oauth/token', {
				method: 'POST',
				body: data,
			});
			
			if (response.ok) {
				console.log("-- Request to API --");
				const responseContent = await response.json();
				const userData = await this.getUserInfo(responseContent);
				if (userData) {
					const payload = {
						sub: userData.id,
						login: userData.login,
						tfa_enabled: userData.TFA_isEnabled,
						pp: userData.officialProfileImage,
					};
					const accessToken = await this.jwtService.signAsync(payload);
					return { access_token: accessToken };
				}
				else 
				{
					console.error("Cannot retrieve user information");
					throw new Error("Cannot retrieve user information");
				}
			}
			else {
				console.log(response.status);
				throw new Error("Cannot extract data from fetch() response");
			}
		} catch (error) {
			console.error("-- Request to API FAILED --");
			throw error;
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

	/**************************************************************/
	/***							2FA							***/
	/**************************************************************/

	async activate2FA(login: any) {

		try {
			const secret = speakeasy.generateSecret();

			// We find the user activating 2FA and save the temporary secret
			this.usersService.register2FATempSecret(login, secret.base32);

			// This function will return a QRCode URL we can use on client side
			// to enable 2FA with an authenticator service
			const qrcodeURL = await new Promise<string>((resolve, reject) => {
				QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
					if (err)
					{
						console.error(err);
						reject(err);
					}
					else
					{
						console.log(data_url);
						resolve(data_url);
					}
				});
			});
			return { qrcodeURL };
		}
		catch (error) {
			console.error("!! 2FA activation failed !!");
			throw new Error("QRCode generation failed: " + error);
		}
	}

	// When the user has enabled 2FA we display a form and request a code
	async verifyCode(code: any) {
		const login = "ebrodeur";

		// We find the user whose need a check to retrieve its temporary secret
		// and compare it with the code he has on its authenticator service
		try {
			this.usersService.getUserByLogin(login).then(user => {
				console.log("TFA_TEMP -> ", user.TFA_temp_secret);
				console.log("CODE -> ", code);
				const base32secret = user.TFA_temp_secret;
	
				// This function will return true if the code given by the client is correct
				var verified = speakeasy.totp.verify({
					secret: base32secret,
					encoding: 'base32',
					token: code
				});
		
				if (verified)
				{
					console.log("-- CODE VERIFIED --");
					this.usersService.save2FASecret(user, code, true);
					return true;
				}
				else {
					console.error("-- INVALID CODE --");
					this.usersService.save2FASecret(user, "", false);
					throw Error("Invalide code");
				}
			}).catch(error => {
				console.error(error);
				throw Error(error);
			});
		}
		catch (error) {
			console.error("!! Token verification failed !!");
			throw new Error("Token verification failed: " + error);
		}
	}
}