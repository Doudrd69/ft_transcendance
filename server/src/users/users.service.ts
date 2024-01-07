import { Injectable, NotFoundException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './entities/users.entity'
import { Friendship } from './entities/friendship.entity'
import { speakeasy } from 'speakeasy'
import { QRCode } from 'qrcode'
import { join } from 'path';
import { FriendRequestDto } from './dto/FriendRequestDto.dto';
import { ChatService } from '../chat/chat.service';
import { UpdateUsernameDto } from './dto/UpdateUsernameDto.dto';
import { existsSync, unlinkSync } from 'fs';
import { BlockUserDto } from './dto/BlockUserDto.dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Friendship)
		private friendshipRepository: Repository<Friendship>,
		private chatService: ChatService,
	) {}

	/**************************************************************/
	/***							2FA							***/
	/**************************************************************/

	async register2FATempSecret(userID: number, secret: string) {

		const userToUpdate = await this.usersRepository.findOne({ where: {id: userID} });
		if (userToUpdate) {
			userToUpdate.TFA_temp_secret = secret;
			return this.usersRepository.save(userToUpdate);
		}

		return ;
	}

	save2FASecret(user: User, code: string, flag: boolean) {
		// hash le code?
		user.TFA_secret = code;
		user.TFA_isEnabled = flag;
		console.log("-- 2FA UPDATED --");
		return this.usersRepository.save(user);
	}

	/**************************************************************/
	/***					USER MANAGEMENT						***/
	/**************************************************************/

	async uploadAvatarURL(avatarURL: string, userID: number): Promise<UpdateResult | undefined> {
		try {
			const user = await this.getUserByID(userID);
			const oldAvatarPath = join(__dirname, 'users', user.avatarURL);

			if (existsSync(oldAvatarPath)) {
				unlinkSync(oldAvatarPath); 
			  }
			if (!user) {
				console.error(`Utilisateur avec l'ID ${userID} non trouvé.`);
				return undefined;
			}
				// Mettez à jour uniquement l'avatarURL
				const updateResult = await this.usersRepository.update({ id: userID }, { avatarURL });

			return updateResult;
		} catch (error) {
			console.error('Erreur lors de la mise à jour de l\'avatarURL :', error);
			return undefined;
		}
	}

	async getAvatar(userId: number): Promise<string | null> {
		const user = await this.getUserByID(userId);
	
		if (!user || !user.avatarURL) {
			console.log("Avatar not found");
			return null;
		}
		return user.avatarURL;
	}

	async getAvatarbyLogin(login: string): Promise<string | null> {
		const user = await this.getUserByLogin(login);
	
		if (!user || !user.avatarURL) {
			console.log("Avatar not found");
			return null;
		}
		return user.avatarURL;
	}

	async getAvatarbyLoginBis(login: string): Promise<string | null> {
		const user = await this.getUserByLogin(login);
	
		if (!user || !user.avatarURL) {
			console.log("Avatar not found");
			return null;
		}
		return user.avatarURL;
	}
	// async deleteUserAvatar(data: Buffer, fileName:string , userID: number) {
		
	// 	const avatar = await this.avatarService.create(userID, data, fileName);
	// 	if (!avatar)
	// 		throw console.log("error");
	// 	await this.usersRepository.update(userID, {avatarID : avatar.ID})
	// 	return avatar;
	// }

	// async getUserAvatar(userID: number): Promise<Avatar> {
	// 	const user = await this.usersRepository.findOne({
	// 	  where: { id: userID },
	// 	});
	  
	// 	if (!user || !user.avatarID) {
	// 	  throw new NotFoundException(`User or avatar not found for ID ${userID}`);
	// 	}

	// 	return this.avatarService.getAvatarByID(user.avatarID);
	//   }

	// Testing purpose - Maybe future implementation
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

	async updateUserStatus(userID: number, flag: boolean) {

		const user = await this.usersRepository.findOne({where: { id: userID }});
		if (user) {
			user.isActive = flag;
			return await this.usersRepository.save(user);
		}
	}

	async createNew42User(userData): Promise<User> {
		const new42User = new User();
		new42User.login = userData.login;
		new42User.firstname = userData.firstname;
		new42User.officialProfileImage = userData.image;
		new42User.groups = [];
		return this.usersRepository.save(new42User);
	}

	async updateUsername(updateUsernameDto: UpdateUsernameDto): Promise<User> {

		const user = await this.usersRepository.findOne({ where: {id: updateUsernameDto.userID} });
		if (user) {
			user.username = updateUsernameDto.newUsername;
			return await this.usersRepository.save(user);
		}

		console.error("Fatal error: user not found");
		return;
	}

	/**************************************************************/
	/***				FRIENDSHIP MANAGEMENT					***/
	/**************************************************************/

	async createFriendship(friendRequestDto: FriendRequestDto): Promise<Friendship | boolean> {

		if (friendRequestDto.initiatorLogin === friendRequestDto.recipientLogin) {
			console.log("Fatal error: user can't add himself as friend");
			return false;
		}

		// recherche par login ou username?
		const initiator = await this.usersRepository.findOne({
			where: {login: friendRequestDto.initiatorLogin},
			relations: ["initiatedFriendships"],
		});

		// recherche par login ou username?
		const recipient = await this.usersRepository.findOne({
			where: {login: friendRequestDto.recipientLogin},
			relations: ["initiatedFriendships"],
		});

		if (!recipient) {
			console.log("Recipiend does not exist");
			return false;
		}

		if (initiator) {
			
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

			console.log("A friend request between those two users already exists : FR id = ", friendshipAlreadyExists.id);
			return friendshipAlreadyExists;
		}
		
		console.log("Fatal errror: user does not exist");
		return false;
	}
	
	async updateFriendship(friendRequestDto: FriendRequestDto, flag: boolean): Promise<Friendship> {

		// recherche par login ou username?
		const initiator = await this.usersRepository.findOne({
			where: { login: friendRequestDto.initiatorLogin },
			relations: ["initiatedFriendships", "acceptedFriendships", "groups"],
		});

		const friend = await this.usersRepository.findOne({
			where: { login: friendRequestDto.recipientLogin },
			relations: ["initiatedFriendships", "acceptedFriendships", "groups"],
		});
	  
		if (initiator && friend) {

			const friendshipToUpdate = await this.friendshipRepository.findOne({
				where: { initiator: { id: initiator.id }, friend: { id: friend.id } },
			});
	
			if (friendshipToUpdate) {

				friendshipToUpdate.isAccepted = flag;
				await this.friendshipRepository.save(friendshipToUpdate);

				if (flag) {
					const status = this.chatService.createFriendsConversation(initiator, friend);
					console.log(status);
				}

				return friendshipToUpdate;
		  	}
		}

		console.error("Fatal error: could not find user (updateFriendship)");
		return ;
	}

	async acceptFriendship(friendRequestDto: FriendRequestDto): Promise<Friendship> {

		const newFriendship = await this.updateFriendship(friendRequestDto, true);
		if (newFriendship) {
			return newFriendship;
		}
		console.log("Fatal error: could not update friendship status");
		return ;
	}

	async blockUser(blockUserDto: BlockUserDto): Promise<Friendship> {

		const friendshipToUpdate = await this.updateFriendship(blockUserDto, false);
		if (friendshipToUpdate) {
			return friendshipToUpdate;
		}

		console.log("Fatal error: could not update frienship status");
		return ;
	}

	/**************************************************************/
	/***					GETTERS						***/
	/**************************************************************/

	async getUserByID(userID: number): Promise<User> {
		return await this.usersRepository.findOne({ where: {id: userID} });
	}

	async getUserByLogin(loginToSearch: string): Promise<User> {
		return await this.usersRepository.findOne({ where: {login: loginToSearch}});
	}

	async getFriendships(username: string): Promise<Friendship[]> {

		console.log(username, "friend list loading...");
		let user = new User();
		// recherche par login ou username?
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
		return [];
	}

	async getPendingFriendships(username: string): Promise<Friendship[]> {

		console.log(username, " pending friendships loading...");
		let user = new User();
		// recherche par login ou username?
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
