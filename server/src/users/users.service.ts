import { Injectable, NotFoundException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './entities/users.entity'
import { Friendship } from './entities/friendship.entity'
import { speakeasy } from 'speakeasy'
import { QRCode } from 'qrcode'
import { FriendRequestDto } from './dto/FriendRequestDto.dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Friendship)
		private friendshipRepository: Repository<Friendship>,
	) {}

	/**************************************************************/
	/***							2FA							***/
	/**************************************************************/

	register2FATempSecret(login: string, secret: string) {
		this.getUserByLogin(login).then(userToUpdate => {
			userToUpdate.TFA_temp_secret = secret;
			return this.usersRepository.save(userToUpdate);
		}).catch(error => {
			throw new Error(error);
		});
	}

	save2FASecret(user: User, code: any, flag: boolean) {
		// hash le code?
		user.TFA_secret = code;
		user.TFA_isEnabled = flag;
		console.log("-- 2FA UPDATED --");
		return this.usersRepository.save(user);
	}

	/**************************************************************/
	/***					USER MANAGEMENT						***/
	/**************************************************************/

	// getAvatarById(userId: number, res: Response) {
	// 	this.usersRepository.findOne({ where: {id: userId}}).then(
	// 		user => {
	// 			if (user.avatarImage) {
	// 				res.setHeader('Content-Type', 'image/jpeg'); // Set appropriate content type
	// 				return res.send(user.avatarImage);
	// 			}
	// 		}).catch(
	// 			error => {
	// 				return res.status(404).send('Avatar not found: ', error);
	// 		}
	// 	);
	// }

	// uploadAvatar(avatar: any) {
	// 	this.getUserByLogin("").then(userToUpdate => {
	// 		userToUpdate.avatarImage = avatar.buffer;
	// 		return this.usersRepository.save(userToUpdate);
	// 	}).catch(error => {
	// 		console.log("Error: cannot upload avatar image: ", error);
	// 	});
	// }

	createNew42User(userData) {
		console.log("In DB registration: ", JSON.stringify(userData));
		const login = userData.login;
		const firstname = userData.firstname;
		const officialProfileImage = userData.image;
		const socket = userData.socket;
		const new42User = this.usersRepository.create({ login, firstname, officialProfileImage, socket});
		return this.usersRepository.save(new42User);
	}

	updateUsername(login: string, newUsername: string) {
		this.getUserByLogin(login).then(userToUpdate => {
			userToUpdate.username = newUsername;
			return this.usersRepository.save(userToUpdate);
		}).catch(error => {
			console.log("Cannot update username :", error);
			throw new Error(error);
		});
	}

	createFriendship(friendRequestDto: FriendRequestDto) {
		this.getUserByLogin(friendRequestDto.initiatorLogin).then(initiator => {
			this.getUserByLogin(friendRequestDto.recipientLogin).then(friend => {
				console.log("Initiator: ", initiator.login);
				console.log("Recipient: ", friend.login);
				const newFriendship = this.friendshipRepository.create({ initiator, friend });
				return this.friendshipRepository.save(newFriendship);
			}).catch(error => {
				console.log("Error in second promise: ", error);
			})
		}).catch(error => {
			console.log("Error in first promise: ", error);
		});
	}
	
	updateFriendship(friendRequestDto: FriendRequestDto, flag: boolean) {
		this.getUserByLogin(friendRequestDto.initiatorLogin).then(initiator => {
			this.getUserByLogin(friendRequestDto.recipientLogin).then(friend => {
				const frienshipToUpdate = initiator.initiatedFriendships.find(
					(friendship) => friendship.friend.login === friendRequestDto.recipientLogin
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
	}