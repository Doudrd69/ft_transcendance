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

	async createNewUser(username: string): Promise<User> {
		const userToCreate = await this.usersRepository.findOne({ where: {username: username } });
		if (!userToCreate) {
			// const saltOrRounds = 10;
			// password = await bcrypt.hash(password, saltOrRounds);
			const newUser = new User();
			newUser.login = username;
			newUser.firstname = username;
			newUser.username = username;
			newUser.officialProfileImage = "";
			return await this.usersRepository.save(newUser);
		}
		throw new Error('User with this username already exists');
	}

	// async deleteUser(username: string) {
	// 	const userToDelete = await this.usersRepository.findOne({ where: { username } });
	// 	if (userToDelete) {
	// 		return await this.usersRepository.delete(username);
	// 	}
	// 	throw new NotFoundException();
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

	/**************************************************************/
	/***				FRIENDSHIP MANAGEMENT					***/
	/**************************************************************/

	async createFriendship(friendRequestDto: FriendRequestDto): Promise<Friendship | null> {

		console.log("DTO received in createFrienship : ", friendRequestDto);

		const initiator = await this.usersRepository.findOne({
			where: {login: friendRequestDto.initiatorLogin},
			relations: ["initiatedFriendships"],
		});

		const recipient = await this.usersRepository.findOne({
			where: {login: friendRequestDto.recipientLogin},
			relations: ["initiatedFriendships"],
		});

		if (initiator && recipient) {
			
			// Check if the frienships already exists in DB
			// Only works one way, need to check the reverse (initiator <-> friend)
			const friendshipAlreadyExists = await this.friendshipRepository.findOne({
				where: {initiator: initiator, friend: recipient},
			});
			
			if (!friendshipAlreadyExists) {
	
				let newFriendship = new Friendship();
				newFriendship.initiator = initiator;
				newFriendship.friend = recipient;
				return await this.friendshipRepository.save(newFriendship);
			}
			// if the frienship already exists between the users, don't do anything
			return null;
		}
		throw Error("Fatal error");
	}
	
	async updateFriendship(friendRequestDto: FriendRequestDto, flag: boolean): Promise<Friendship> {

		console.log("==== UPDATING FRIENDSHIP TO ", flag, " ====");

		const initiator = await this.usersRepository.findOne({
			where: {login: friendRequestDto.initiatorLogin},
			relations: ["initiatedFriendships", "acceptedFriendships"],
		});

		const friend = await this.usersRepository.findOne({
			where: {login: friendRequestDto.recipientLogin},
			relations: ["initiatedFriendships", "acceptedFriendships"],
		});

		if (initiator && friend) {

			let friendshipToUpdate = new Friendship();
			friendshipToUpdate = await this.friendshipRepository.findOne({
				where: {initiator: initiator, friend: friend},
			});

			friendshipToUpdate.isAccepted = flag;
			await this.friendshipRepository.save(friendshipToUpdate);

			// Reload initiator and friend entities
  			const initiator2 = await this.usersRepository.findOne({
    			where: { login: friendRequestDto.initiatorLogin },
    			relations: ["initiatedFriendships", "acceptedFriendships"],
  			});

  			const friend2 = await this.usersRepository.findOne({
    			where: { login: friendRequestDto.recipientLogin },
    			relations: ["initiatedFriendships", "acceptedFriendships"],
  			});

			console.log(initiator2.login, " Init after updt --> ", initiator2.initiatedFriendships);
			console.log(friend2.login, " Init after updt --> ", friend2.initiatedFriendships);

			console.log(initiator2.login, " Accepted after updt --> ", initiator2.acceptedFriendships);
			console.log(friend2.login, " Accepted after updt --> ", friend2.acceptedFriendships);

			return friendshipToUpdate;
		}
		return ;
	}

	async acceptFriendship(friendRequestDto: FriendRequestDto): Promise<Friendship> {

		const newFriendship = await this.updateFriendship(friendRequestDto, true);
		if (newFriendship) {
			console.log("Updated friendship : ", newFriendship);
			return newFriendship
		}
		console.log("Fatal error: could not add ", friendRequestDto.initiatorLogin, " to your friend list");
		return ;
	}

	/**************************************************************/
	/***					GETTERS						***/
	/**************************************************************/
		
	findUserByLogin(loginToSearch: string) {
		return this.usersRepository.findOne({ where: {login: loginToSearch}});
	}

	getUserByLogin(loginToSearch: string): Promise<User> {
		return this.usersRepository.findOne({ where: {login: loginToSearch}});
	}

	async getFriendships(username: string): Promise<Friendship[]> {

		console.log(username, " friend list loading...");
		let user = new User();
		user = await this.usersRepository.findOne({
			where: {login: username},
			relations: ["initiatedFriendships.friend", "acceptedFriendships.initiator"],
		});

		if (user) {
			let initiatedfriends = await user.initiatedFriendships.filter((friendship: Friendship) => friendship.isAccepted);
			let acceptedfriends = await user.acceptedFriendships.filter((friendship: Friendship) => friendship.isAccepted);
			const friends = [...initiatedfriends, ...acceptedfriends];
			return friends;
		}
		return ;
	}
}
