import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './entities/users.entity'
import { Friendship } from './entities/friendship.entity'
import { speakeasy } from 'speakeasy'
import { QRCode } from 'qrcode'

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Friendship)
		private friendshipRepository: Repository<Friendship>,
	) {}

	// private passwordPolicy(password: string) {
	// 	if (password.length >= 8)
	// 		return true;
	// 	return false;
	// }

	// register2FASecret(secret: string) {
	// 	const userToUpdate = this.usersRepository.find();
	// 	userToUpdate.TFA_temp_secret = secret;
	// 	return this.usersRepository.save(userToUpdate);
	// }

	createNew42User(userData) {
		console.log("In DB registration: ", JSON.stringify(userData));
		const login = userData.login;
		const firstname = userData.firstname;
		// const lastname = userData.lastname;
		const image = userData.image;
		const socket = userData.socket;
		const new42User = this.usersRepository.create({ login, firstname, image, socket});
		return this.usersRepository.save(new42User);
	}

	updateUsername(newUsername: string, userLogin: string) {
		this.getUserByLogin(userLogin).then(userToUpdate => {
			userToUpdate.username = newUsername;
			return this.usersRepository.save(userToUpdate);
		}).catch(error => {
			console.log("Error: cannot update username :", error);
		});
	}

	// il faudra recuperer un user (ou un moyen de l'identifier : socket, login etc)
	// generateSecretKeyFor2FA(value: string, flag: boolean) {
	// 	const secret = speakeasy.generateSecret();
	// 	const userSecretKey = secret.base32;
	// 	//find le bon user
	// 	const userToUpdate = this.usersRepository.find({where: {login: value} });
	// 	userToUpdate.secret = userSecretKey;
	// 	this.usersRepository.save(userToUpdate);
	// 	if (flag)
	// 		return generateQRcode();
	// }

	createFriendship(initiatorLogin: string, recipientLogin: string) {
		console.log("Friendship creation...");
		this.getUserByLogin(initiatorLogin).then(initiator => {
			this.getUserByLogin(recipientLogin).then(friend => {
				const newFriendship = this.friendshipRepository.create({ initiator, friend });
				return this.friendshipRepository.save(newFriendship);
			}).catch(error => {
				console.log("Error in second promise: ", error);
			})
		}).catch(error => {
			console.log("Error in first promise: ", error);
		});
	}
	
	updateFriendship(initiatorLogin: string, recipientLogin: string, flag: boolean) {
		console.log("Friendship request responses processing...");
		this.getUserByLogin(initiatorLogin).then(initiator => {
			this.getUserByLogin(recipientLogin).then(friend => {
				const frienshipToUpdate = initiator.initiatedFriendships.find(
					(friendship) => friendship.friend.login === recipientLogin
					);
					if (frienshipToUpdate) {
						frienshipToUpdate.isAccepted = flag;
						return this.friendshipRepository.save(frienshipToUpdate); // friendship repo
					}
				}).catch(error => {
					console.log("Error in second promise: ", error);
				})
			}).catch(error => {
				console.log("Error in first promise: ", error);
			})
		}
		
	getUserByLogin(loginToSearch: string): Promise<User> {
		return this.usersRepository.findOne({ where: {login: loginToSearch}});
	}

	findUserByLogin(loginToSearch: string) {
		return this.usersRepository.findOne({ where: {login: loginToSearch}});
	}

		// async createNewUser(username: string, password: string): Promise<User> {
		// 	const userToCreate = await this.usersRepository.findOne({ where: { username } });
		// 	if (!userToCreate) {
		// 		const saltOrRounds = 10;
		// 		if (this.passwordPolicy(password)) {
		// 			password = await bcrypt.hash(password, saltOrRounds);
		// 			const newUser = this.usersRepository.create({ username, password });
		// 			return await this.usersRepository.save(newUser);
		// 		}
		// 		throw new Error('Password policy : 8 characters minimum');
		// 	}
		// 	throw new Error('User with this username already exists');
		// }
	
		// async deleteUser(username: string) {
		// 	const userToDelete = await this.usersRepository.findOne({ where: { username } });
		// 	if (userToDelete) {
		// 		return await this.usersRepository.delete(username);
		// 	}
		// 	throw new NotFoundException();
		// }
	
		// async updateUser(username: string, newUsername: string) {
		// 	const userToUpdate = await this.usersRepository.findOne({ where: { username } });
		// 	if (userToUpdate) {
		// 		userToUpdate.username = newUsername;
		// 		return await this.usersRepository.save(userToUpdate);
		// 	}
		// 	throw new NotFoundException();
		// }
	}