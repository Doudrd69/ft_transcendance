import { Injectable, NotFoundException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './entities/users.entity'
import { Friendship } from './entities/friendship.entity'
import { speakeasy } from 'speakeasy'
import { QRCode } from 'qrcode'
import { FriendRequestDto } from './dto/FriendRequestDto.dto';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Friendship)
		private friendshipRepository: Repository<Friendship>,
		private chatService: ChatService,
	) {}

	private async createConversationForInitiator(initiatorUsername: string, friendUsername: string)  {

		// La conversion doit avoir le nom de l'ami

		// creer la conversation + un group pour l'initiator
		const conversationDto = {
			name: initiatorUsername,
			username: initiatorUsername,
			is_channel: false,
		}
		
		// La conversation est creee et l'initiator y est relie
		const conversation = await this.chatService.createConversation(conversationDto);
		if (!conversation)
			console.error("Fatal error");
		
		// const status = await this.chatService.addUserToConversation(friendUsername, conversation.id);
		// if (!status)
		// 	console.error("Fatal error");

		return ;
	}

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

	async createFriendship(friendRequestDto: FriendRequestDto): Promise<Friendship> {

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
			
			const friendshipAlreadyExists = await this.friendshipRepository.findOne({
				where: {initiator: initiator, friend: recipient},
			});
			
			if (!friendshipAlreadyExists) {
	
				let newFriendship = new Friendship();
				newFriendship.initiator = initiator;
				newFriendship.friend = recipient;
				await this.friendshipRepository.save(newFriendship);
				return newFriendship;
			}
		}
		return ;
	}
	
	async updateFriendship(friendRequestDto: FriendRequestDto, flag: boolean): Promise<Friendship> {

		const initiator = await this.usersRepository.findOne({
			where: {login: friendRequestDto.initiatorLogin},
			relations: ["initiatedFriendships", "acceptedFriendships"],
		});

		const friend = await this.usersRepository.findOne({
			where: {id: friendRequestDto.recipientID},
			relations: ["initiatedFriendships", "acceptedFriendships"],
		});

		if (initiator && friend) {

			let friendshipToUpdate = new Friendship();
			friendshipToUpdate = await this.friendshipRepository.findOne({
				where: {initiator: initiator, friend: friend},
			});

			friendshipToUpdate.isAccepted = flag;
			await this.friendshipRepository.save(friendshipToUpdate);

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
		console.log("Fatal error");
		return ;
	}

	/**************************************************************/
	/***					GETTERS						***/
	/**************************************************************/

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

	async getPendingFriendships(username: string): Promise<Friendship[]> {

		console.log(username, " pending friendships loading...");
		let user = new User();
		user = await this.usersRepository.findOne({
			where: {login: username},
			relations: ["initiatedFriendships.friend", "acceptedFriendships.initiator"],
		});

		if (user) {
			let initiatedfriends = await user.initiatedFriendships.filter((friendship: Friendship) => !friendship.isAccepted);
			let acceptedfriends = await user.acceptedFriendships.filter((friendship: Friendship) => !friendship.isAccepted);
			const friends = [...initiatedfriends, ...acceptedfriends];
			return friends;
		}
		return ;
	}
}