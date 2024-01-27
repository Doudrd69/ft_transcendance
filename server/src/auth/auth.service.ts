import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { User } from '../users/entities/users.entity'
import { JwtService } from '@nestjs/jwt'
import dotenv from 'dotenv';
import { RequestTfaDto } from './dto/RequestTfaDto.dto';
import { AuthenticatorCodeDto } from './dto/AuthenticatorCodeDto.dto';
// import * as bcrypt from 'bcrypt';

var speakeasy = require("speakeasy");
var QRCode = require('qrcode');

dotenv.config();

const redirectUri = process.env.SERVER_REDIRECT_URI;
const clientId = process.env.SERVER_TOKEN_CLIENT_ID;
const clientSecret = process.env.SERVER_TOKEN_CLIENT_SECRET;
const baseURL = process.env.PROJECT_URL;

console.log("BASE URL: ", baseURL);

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
			
			if (response.ok) {
				const responseContent = await response.json();

				const userInformation = {
					'login': responseContent.login,
					'firstname': responseContent.first_name,
					'image': responseContent.image,
				}

				const result = await this.usersService.getUserByLogin(userInformation.login);
				if (result) {
					console.log("User already exists in DB");
					return result;
				}
				else {
					return this.usersService.createNew42User(userInformation);
				}
			}
			else {
				throw "42 API request failed";
			}

		} catch (error) {
			console.log(error);
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
				console.log("-- Request to API success --");
				const responseContent = await response.json();

				const userData = await this.getUserInfo(responseContent);
				if (userData) {

					// payload for JWT
					const payload = {
						sub: userData.id,
						login: userData.login,
						username: userData.username,
						tfa_enabled: userData.TFA_isEnabled,
						pp: userData.officialProfileImage,
					};

					const accessToken = await this.jwtService.signAsync(payload);
					return { access_token: accessToken };
				}
				else 
				{
					throw "Cannot retrieve user information";
				}
			}
			else {
				throw (`Fatal error: 42 API request failed, ${response.status}, ${response.statusText}`);
			}
		} catch (error) {
			console.error("-- Request to API FAILED --", error);
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


	async desactivate2FA(requestTfaDto: RequestTfaDto) {

		const user : User = await this.usersService.getUserByID(requestTfaDto.userID);

		if (user) {
			await this.usersService.upate2FAState(user, false);
			return false;
		}

		throw new Error("Fatal error");
	}

	// On genere le qrcode a la demande d'activation de la 2fa
	async activate2FA(requestTfaDto: RequestTfaDto) {

		try {
			// Verifier si le secret existe deja, auquel cas, ne pas le regenerer
			const secret = await this.usersService.get2faSecret(requestTfaDto.userID);
			if (!secret) {
				const newSecret = speakeasy.generateSecret();
				await this.usersService.register2FATempSecret(requestTfaDto.userID, newSecret.base32);

				const qrcodeURL = await new Promise<string> ( (resolve, reject) => {
					QRCode.toDataURL(newSecret.otpauth_url, function(err, data_url) {
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
				console.log("returnng qrcode");
				return { qrcodeURL };
			}
		}
		catch (error) {
			throw new Error("Fatal errorr: " + error);
		}
	}

	async get2fa(userID: number) {
		const user = await this.usersService.getUserByID(userID);
		console.log("get2fa", user.TFA_isEnabled);
		if (user) {
			return user.TFA_isEnabled;
		}

		throw new Error("User does not exist");
	}

	async verifyCode(authenticatorCodeDto: AuthenticatorCodeDto) {

		// We find the user whose need a check to retrieve its temporary secret
		// and compare it with the code he has on its authenticator service
		try {

			const user = await this.usersService.getUserByID(authenticatorCodeDto.userID);
			if (user) {

				// Si on a pas de secret, on prend le temporaire
				let base32secret = user.TFA_secret;
				if (!base32secret) {
					base32secret = user.TFA_temp_secret;
				}
	
				// This function will return true if the code given by the client is correct
				var verified = speakeasy.totp.verify({
					secret: base32secret,
					encoding: 'base32',
					token: authenticatorCodeDto.code,
				});
		
				if (verified)
				{
					console.log("-- CODE VERIFIED --");
					if (!user.TFA_secret)
						this.usersService.save2FASecret(user, base32secret);
					await this.usersService.upate2FAState(user, true);
					return true;
				}
				else {
					console.error("-- INVALID CODE --");
					this.usersService.upate2FAState(user, false);
					throw Error("Invalide code");
				}
			}

		}
		catch (error) {
			console.error("!! Token verification failed !!");
			throw new Error(error);
		}
	}
}