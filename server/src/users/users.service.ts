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
import { Conversation } from 'src/chat/entities/conversation.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Friendship)
		private friendshipRepository: Repository<Friendship>,
		private chatService: ChatService,
	) {}

	private async isUsernameValid(usernameToFInd: string): Promise<boolean> {

		const usernameMatch = await this.usersRepository.findOne({ where: {username: usernameToFInd } });

		if (usernameMatch) {
			return false;
		}
		return true;
	}

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
		console.log("-- 2FA UPDATED to ", flag, " --");
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
				throw new Error("user not found");
			}
				// Mettez à jour uniquement l'avatarURL
				const updateResult = await this.usersRepository.update({ id: userID }, { avatarURL });

			return updateResult;
		} catch (error) {
			throw error;
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
			// const isMatch = await bcrypt.compare(password, hash);
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
		new42User.username = userData.login;
		new42User.firstname = userData.firstname;
		new42User.officialProfileImage = userData.image;
		new42User.groups = [];
		return this.usersRepository.save(new42User);
	}
	
	async updateUsername(updateUsernameDto: UpdateUsernameDto) {
		
		const user : User = await this.usersRepository.findOne({ where: {id: updateUsernameDto.userID} });
		const usernameValidation = await this.isUsernameValid(updateUsernameDto.newUsername);
		
		if (usernameValidation) {

			if (user) {
				user.username = updateUsernameDto.newUsername;
				await this.usersRepository.save(user);
				return { newUsername: user.username };
			}

			throw new Error("Fatal error");
		}

		throw new Error("username is already used");
	}

	/**************************************************************/
	/***				FRIENDSHIP MANAGEMENT					***/
	/**************************************************************/

	async createFriendship(friendRequestDto: FriendRequestDto): Promise<boolean> {

		if (friendRequestDto.initiatorLogin === friendRequestDto.recipientLogin) {
			throw new Error("Fatal error");
		}

		const initiator = await this.usersRepository.findOne({
			where: {username: friendRequestDto.initiatorLogin},
			relations: ["initiatedFriendships"],
		});

		const recipient = await this.usersRepository.findOne({
			where: {username: friendRequestDto.recipientLogin},
			relations: ["initiatedFriendships"],
		});

		if (!recipient) {
			throw new Error("user does not exist");
		}

		if (initiator) {
			
			const friendshipAlreadyExists : Friendship = await this.friendshipRepository.findOne({
				where: {initiator: initiator, friend: recipient},
			});
			
			if (!friendshipAlreadyExists) {
	
				let newFriendship = new Friendship();
				newFriendship.initiator = initiator;
				newFriendship.friend = recipient;
				await this.friendshipRepository.save(newFriendship);
				return true;
			}
			else if (friendshipAlreadyExists && !friendshipAlreadyExists.isAccepted) {
				return true;
			}

			throw new Error(`${recipient.username} is already in your friend list`);
		}
		
		throw new Error("Fatal error");
	}
	
	async updateFriendship(friendRequestDto: FriendRequestDto, flag: boolean): Promise<Conversation | Friendship> {

		const initiator = await this.usersRepository.findOne({
			where: { username: friendRequestDto.initiatorLogin },
			relations: ["initiatedFriendships", "acceptedFriendships", "groups"],
		});

		const friend = await this.usersRepository.findOne({
			where: { username: friendRequestDto.recipientLogin },
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
					const conversation = this.chatService.createFriendsConversation(initiator, friend);
					return conversation;
				}

				return friendshipToUpdate;
		  	}
		}

		throw new Error("Fatal error");
	}

	async acceptFriendship(friendRequestDto: FriendRequestDto): Promise<Conversation | Friendship> {

		const newConversationBetweenFriends = await this.updateFriendship(friendRequestDto, true);
		if (newConversationBetweenFriends) {
			return newConversationBetweenFriends;
		}

		throw new Error("Fatal error");
	}

	async removeFriend(blockUserDto: BlockUserDto): Promise<Conversation | Friendship> {

		const friendshipToUpdate = await this.updateFriendship(blockUserDto, false);
		if (friendshipToUpdate) {
			return friendshipToUpdate;
		}

		throw new Error("Fatal error");
	}

	async blockUser(blockUserDto: BlockUserDto): Promise<boolean> {

		const user : User = await this.usersRepository.findOne({ where: { username: blockUserDto.initiatorLogin } });
		const userToBlock : User = await this.usersRepository.findOne({ where: {username: blockUserDto.recipientLogin } });
		
		if (user && userToBlock) {
			user.blockedUsers.push(userToBlock.login);
			await this.usersRepository.save(user);
			return true;
		}

		throw new Error("Fatal error");
	}

	async unblockUser(blockUserDto: BlockUserDto): Promise<boolean> {

		const user : User = await this.usersRepository.findOne({ where: { username: blockUserDto.initiatorLogin } });
		const userToUnblock : User = await this.usersRepository.findOne({ where: {username: blockUserDto.recipientLogin } });

		if (user && userToUnblock) {
			const filter = user.blockedUsers.filter((user: string) => user != userToUnblock.login);
			user.blockedUsers = filter;
			await this.usersRepository.save(user);
			return true;
		}

		throw new Error("Fatal error");
	}

	/**************************************************************/
	/***					GETTERS						***/
	/**************************************************************/

	async getUserByID(userID: number): Promise<User> {
		return await this.usersRepository.findOne({ where: {id: userID} });
	}

	async getUserByLogin(loginToSearch: string): Promise<User> {
		// We search by login because it is unique
		return await this.usersRepository.findOne({ where: { login: loginToSearch} });
	}

	async getBlockedUserList(userID: number) {

		const user = await this.usersRepository.findOne({ where: { id: userID } });
		if (user) {
			return user.blockedUsers;
		}

		return [];
	}

	async getFriendships(username: string): Promise<Friendship[]> {

		console.log(username, "friend list loading...");

		const initiatedfriends = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.initiator', 'initiator')
			.where('initiator.username != :username', { username })
			.andWhere('friendship.isAccepted = true')
			.getMany();
		
		const acceptedfriends = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.friend', 'friend')
			.where('friend.username != :username', { username })
			.andWhere('friendship.isAccepted = true')
			.getMany();
 
		// let array = [];
		const friendships = [...initiatedfriends, ...acceptedfriends];
		// friendships.forEach((element: Friendship) => {
		// 	array.push({
		// 		id: element.friend ? element.friend.id : element.initiator ? element.initiator.id : -1,
		// 		username: element.friend ? element.friend.username : element.initiator ? element.initiator.username : 'unknown user',
		// 	});
		// });

		return friendships;
	}

	async getPendingFriendships(username: string): Promise<Friendship[]> {

		const initiatedfriends = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.initiator', 'initiator')
			.where('initiator.username != :username', { username })
			.andWhere('friendship.isAccepted = false')
			.getMany();
		
		const acceptedfriends = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.friend', 'friend')
			.where('friend.username != :username', { username })
			.andWhere('friendship.isAccepted = false')
			.getMany();
 
		// let array = [];
		const friendships = [...initiatedfriends, ...acceptedfriends];
		// friendships.forEach((element: Friendship) => {
		// 	array.push({
		// 		id: element.friend ? element.friend.id : element.initiator ? element.initiator.id : -1,
		// 		username: element.friend ? element.friend.username : element.initiator ? element.initiator.username : 'unknown user',
		// 	});
		// });

		return friendships;
	}
}
