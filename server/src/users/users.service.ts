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
			console.error("Fatal error: user not found");
			return { newUsername: null };
		}

		console.log("Error: this username is already used");
		return { newUsername: null };
	}

	/**************************************************************/
	/***				FRIENDSHIP MANAGEMENT					***/
	/**************************************************************/

	async createFriendship(friendRequestDto: FriendRequestDto): Promise<boolean> {

		console.log("FRDto: ", friendRequestDto);

		if (friendRequestDto.initiatorLogin === friendRequestDto.recipientLogin) {
			console.log("Fatal error: user can't add himself as friend");
			return false;
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
			console.log("Recipiend does not exist");
			return false;
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

			console.log("A friend request between those two users already exists : FR id = ", friendshipAlreadyExists.id);
			return false
		}
		
		console.log("Fatal errror: user does not exist");
		return false;
	}
	
	async updateFriendship(friendRequestDto: FriendRequestDto, flag: boolean): Promise<Conversation | Friendship> {

		// recherche par username a mettre en place
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

		console.error("Fatal error: could not find user (updateFriendship)");
		return ;
	}

	async acceptFriendship(friendRequestDto: FriendRequestDto): Promise<Conversation | Friendship> {

		const newConversationBetweenFriends = await this.updateFriendship(friendRequestDto, true);
		if (newConversationBetweenFriends) {
			return newConversationBetweenFriends;
		}

		console.log("Fatal error: could not update friendship status");
		return ;
	}

	async removeFriend(blockUserDto: BlockUserDto): Promise<Conversation | Friendship> {

		const friendshipToUpdate = await this.updateFriendship(blockUserDto, false);
		if (friendshipToUpdate) {
			return friendshipToUpdate;
		}

		console.log("Fatal error: could not update frienship status");
		return ;
	}

	// Pour block/unblock ne pas oublier de faire emit sur les events correspondant
	// peut etre return l'id du user qui est bloque pour le whoBlock#ID
	async blockUser(blockUserDto: BlockUserDto): Promise<boolean> {

		const user : User = await this.usersRepository.findOne({ where: { username: blockUserDto.initiatorLogin } });
		const userToBlock : User = await this.usersRepository.findOne({ where: {username: blockUserDto.recipientLogin } });

		if (user && userToBlock) {
			// user.blockedUsers.push(userToBlock.login);
			await this.usersRepository.save(user);
			return true;
		}

		return false;
	}

	async unblockUser(blockUserDto: BlockUserDto): Promise<boolean> {

		const user : User = await this.usersRepository.findOne({ where: { username: blockUserDto.initiatorLogin } });
		const userToUnblock : User = await this.usersRepository.findOne({ where: {username: blockUserDto.recipientLogin } });

		if (user && userToUnblock) {
			// user.blockedUsers.filter((user: string) => user != userToUnblock.login);
			await this.usersRepository.save(user);
			return true;
		}

		return false;
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
			// return user.blockedUsers;
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
			
		// console.log("--------------> ", initiatedfriends);
		
		const acceptedfriends = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.friend', 'friend')
			.where('friend.username != :username', { username })
			.andWhere('friendship.isAccepted = true')
			.getMany();
		
		// console.log("===============> ",acceptedfriends);
		const friendships = [...initiatedfriends, ...acceptedfriends];

		// console.log(friendships);
		return friendships;
	}

	async getPendingFriendships(username: string): Promise<Friendship[]> {

		console.log(username, " pending friendships loading...");

		let user = new User();
		user = await this.usersRepository.findOne({
			where: { username: username },
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
