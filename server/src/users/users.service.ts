import { Injectable, NotFoundException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './entities/users.entity'
import { Friendship } from './entities/friendship.entity'
import { speakeasy } from 'speakeasy'
import { QRCode } from 'qrcode'
import { FriendRequestDto } from './dto/FriendRequestDto.dto';
import { Conversation } from 'src/chat/entities/conversation.entity';

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

	async createNew42User(userData) {
		const new42User = new User();
		new42User.login = userData.login;
		new42User.firstname = userData.firstname;
		new42User.officialProfileImage = userData.image;
		new42User.groups = [];
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

	async createFriendship(friendRequestDto: FriendRequestDto) {

		const initiator = await this.usersRepository.findOne({
			where: {login: friendRequestDto.initiatorLogin},
			relations: ["initiatedFriendships"],
		});

		const friend = await this.usersRepository.findOne({
			where: {login: friendRequestDto.recipientLogin},
			relations: ["initiatedFriendships"],
		});

		if (initiator && friend) {
			console.log("Initiator -> ", initiator.initiatedFriendships);
			console.log("Friend    -> ", friend.initiatedFriendships);

			let newFriendship = new Friendship();
			newFriendship.initiator = initiator;
			newFriendship.friend = friend;
			await this.friendshipRepository.save(newFriendship);
			return newFriendship;
		}

		return ;
	}
	
	async updateFriendship(friendRequestDto: FriendRequestDto, flag: boolean) {

		const initiator = await this.usersRepository.findOne({
			where: {login: friendRequestDto.initiatorLogin},
			relations: ["initiatedFriendships", "acceptedFriendships"],
		});

		const friend = await this.usersRepository.findOne({
			where: {login: friendRequestDto.recipientLogin},
			relations: ["initiatedFriendships", "acceptedFriendships"],
		});

		if (initiator && friend) {

			const friendshipToUpdate = await this.friendshipRepository.findOne({
				where: {initiator: initiator, friend: friend},
			});

			friendshipToUpdate.isAccepted = flag;
			await this.friendshipRepository.save(friendshipToUpdate);
			console.log("Update -> ", friendshipToUpdate);
			return friendshipToUpdate;
		}
	}
		
	findUserByLogin(loginToSearch: string) {
		return this.usersRepository.findOne({ where: {login: loginToSearch}});
	}

	getUserByLogin(loginToSearch: string): Promise<User> {
		return this.usersRepository.findOne({ where: {login: loginToSearch}});
	}

	async getFriendships(username: string): Promise<Friendship[]> {

		const user = await this.usersRepository.findOne({
			where: {login: username},
			relations: ["initiatedFriendships", "initiatedFriendships.friend"],
		});
		if (user) {
			const friendsname = user.initiatedFriendships.filter(friendship => !friendship.isAccepted).map((friendship) => friendship.friend.login);
			console.log("Names -> ", friendsname);
			const pendingFriendRequests = user.initiatedFriendships.filter(friendship => !friendship.isAccepted);
			console.log("Pending -> ", pendingFriendRequests);
			const friends = user.initiatedFriendships.filter(friendship => friendship.isAccepted);
			console.log("Friends --> ", friends);
			return friends;
		}
		return ;
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