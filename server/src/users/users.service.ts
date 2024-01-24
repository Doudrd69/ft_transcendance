import { Injectable, NotFoundException, Res, Inject, forwardRef } from '@nestjs/common';
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
import { GroupMember } from 'src/chat/entities/group_member.entity';
import { Game } from 'src/game/entities/games.entity';
import * as Jimp from 'jimp';
import { promisify } from 'util';
import * as fs from 'fs';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Friendship)
		private friendshipRepository: Repository<Friendship>,
		@InjectRepository(Game)
		private gameRepository: Repository<Game>,
		@Inject(forwardRef(() => ChatService))
		private chatService: ChatService,
	) { }

	private async isUsernameValid(usernameToFInd: string): Promise<boolean> {

		const usernameMatch = await this.usersRepository.findOne({ where: { username: usernameToFInd } });

		if (usernameMatch) {
			return false;
		}
		return true;
	}

	/**************************************************************/
	/***							2FA							***/
	/**************************************************************/

	async register2FATempSecret(userID: number, secret: string) {

		const userToUpdate = await this.usersRepository.findOne({ where: { id: userID } });
		if (userToUpdate) {
			userToUpdate.TFA_temp_secret = secret;
			return this.usersRepository.save(userToUpdate);
		}

		return;
	}

	async save2FASecret(user: User, code: string) {
		user.TFA_secret = code;
		return await this.usersRepository.save(user);
	}

	async upate2FAState(user: User, state: boolean) {
		user.TFA_isEnabled = state;
		if (!state) {
			user.TFA_secret = null;
			user.TFA_temp_secret = null;
		}
		return await this.usersRepository.save(user);
	}

	async get2faSecret(userID: number) {

		const user : User = await this.usersRepository.findOne({ where: { id: userID } });
		if (user) {
			return user.TFA_secret;
		}

		return null;
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

			const updateResult = await this.usersRepository.update({ id: userID }, { avatarURL });
			return updateResult;
		} catch (error) {
			throw error;
		}
	}

	async isPNG(filePath: string): Promise<boolean> {
		try {
			const fileDescriptor = await fs.promises.open(filePath, 'r');
			const buffer = Buffer.alloc(8);
			await fileDescriptor.read(buffer, 0, 8, 0);
			await fileDescriptor.close();
			const signature = buffer.toString('hex');
			return signature === "89504e470d0a1a0a";

		} catch (error) {
			console.error("Error reading file or checking format:", error);
			throw new Error("Invalid file format");
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
		const userToCreate = await this.usersRepository.findOne({ where: { username: username } });
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

		const user = await this.usersRepository.findOne({ where: { id: userID } });

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
		// new42User.games = [];
		new42User.blockedUsers = [];
		return this.usersRepository.save(new42User);
	}

	async updateUsername(updateUsernameDto: UpdateUsernameDto) {

		const user: User = await this.usersRepository.findOne({ where: { id: updateUsernameDto.userID } });
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

	// async blockUser(blockUserDto: BlockUserDto): Promise<boolean> {

	// 	const user : User = await this.usersRepository.findOne({ where: { username: blockUserDto.initiatorLogin } });
	// 	const userToBlock : User = await this.usersRepository.findOne({ where: {username: blockUserDto.recipientLogin } });

	// 	if (user && userToBlock) {
	// 		user.blockedUsers.push(userToBlock.login);
	// 		await this.usersRepository.save(user);
	// 		return true;
	// 	}

	// 	throw new Error("Fatal error");
	// }

	// async unblockUser(blockUserDto: BlockUserDto): Promise<boolean> {

	// 	const user : User = await this.usersRepository.findOne({ where: { username: blockUserDto.initiatorLogin } });
	// 	const userToUnblock : User = await this.usersRepository.findOne({ where: {username: blockUserDto.recipientLogin } });

	// 	if (user && userToUnblock) {
	// 		const filter = user.blockedUsers.filter((user: string) => user != userToUnblock.login);
	// 		user.blockedUsers = filter;
	// 		await this.usersRepository.save(user);
	// 		return true;
	// 	}

	// 	throw new Error("Fatal error");
	// }

	/**************************************************************/
	/***				GAMES MANAGEMENT						***/
	/**************************************************************/

	async getUserGames(userID: number) {

		const user : User = await this.usersRepository.findOne({
			where: { id: userID },
		});

		if (user) {

			const userGames = await this.gameRepository
				.createQueryBuilder('game')
				.where('(game.playerOneID = :id) OR (game.playerTwoID = :id)', { id: user.id })
				.getMany()

			console.log(`User ${user.username} games history: `);
			let array = [];
			userGames.forEach((game: Game) => {
				array.push({
					id: game.gameId,
					playerOne: game.playerOneLogin,
					playerTwo: game.playerTwoLogin,
					scoreP1: game.scoreOne,
					scoreP2: game.scoreTwo,
				});
			});

			if (array) {
				console.log(array);
				return array;
			}
		}

		throw new Error('Fatal error');
	}

	/**************************************************************/
	/***				FRIENDSHIP MANAGEMENT					***/
	/**************************************************************/

	async createFriendship(friendRequestDto: FriendRequestDto): Promise<boolean> {

		if (friendRequestDto.initiatorLogin === friendRequestDto.recipientLogin) {
			throw new Error("Fatal error");
		}

		const initiator = await this.usersRepository.findOne({
			where: { username: friendRequestDto.initiatorLogin },
			relations: ["initiatedFriendships"],
		});

		const recipient = await this.usersRepository.findOne({
			where: { username: friendRequestDto.recipientLogin },
			relations: ["initiatedFriendships"],
		});

		if (!recipient) {
			throw new Error("user does not exist");
		}

		if (initiator) {

			const friendshipAlreadyExists = await this.friendshipRepository
				.createQueryBuilder('friendship')
				.where('(friendship.initiator.id = :initiatorId AND friendship.friend.id = :friendId) OR (friendship.initiator.id = :friendId AND friendship.friend.id = :initiatorId)', {
					initiatorId: initiator.id,
					friendId: recipient.id,
				})
				.getOne();

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

	async findDMConversation(user1: User, user2: User) {

		let conversation = null;
		user1.groups.forEach((userOneGroup: GroupMember) => {
			user2.groups.forEach((userTwoGroup: GroupMember) => {
				if ((userOneGroup.conversation.id == userTwoGroup.conversation.id) &&
					(!userOneGroup.conversation.is_channel && !userTwoGroup.conversation.is_channel)) {
						console.log("== found common DM ==");
						console.log(userOneGroup.conversation);
						conversation = userOneGroup.conversation;
						return;
				}
			});
		});

		return conversation;
	}

	async updateFriendship(friendRequestDto: FriendRequestDto, flag: boolean): Promise<Conversation | Friendship> {

		const initiator = await this.usersRepository.findOne({
			where: { username: friendRequestDto.initiatorLogin },
			relations: ["initiatedFriendships", "acceptedFriendships", "groups", "groups.conversation"],
		});

		const friend = await this.usersRepository.findOne({
			where: { username: friendRequestDto.recipientLogin },
			relations: ["initiatedFriendships", "acceptedFriendships", "groups", "groups.conversation"],
		});

		if (initiator && friend) {

			const friendshipToUpdate = await this.friendshipRepository
				.createQueryBuilder('friendship')
				.where('(friendship.initiator.id = :initiatorId AND friendship.friend.id = :friendId) OR (friendship.initiator.id = :friendId AND friendship.friend.id = :initiatorId)', {
					initiatorId: initiator.id,
					friendId: friend.id,
				})
				.getOne();

			if (friendshipToUpdate) {

				friendshipToUpdate.isAccepted = flag;
				await this.friendshipRepository.save(friendshipToUpdate);

				const privateConversation = await this.findDMConversation(initiator, friend);
				console.log("Found DM: ", privateConversation);
				// si la conv existe deja, on la recreer pas
				if (!privateConversation) {
					if (flag) {
						const conversation = this.chatService.createDMConversation(initiator, friend);
						return conversation;
					}
				}

				return friendshipToUpdate;
			}

			throw new Error("Users are not friend");
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

		const user: User = await this.usersRepository.findOne({ where: { username: blockUserDto.initiatorLogin } });
		const userToBlock: User = await this.usersRepository.findOne({ where: { username: blockUserDto.recipientLogin } });

		if (user && userToBlock) {
			user.blockedUsers.push(userToBlock.login);
			await this.usersRepository.save(user);
			return true;
		}

		throw new Error("Fatal error");
	}

	async unblockUser(blockUserDto: BlockUserDto): Promise<boolean> {

		const user: User = await this.usersRepository.findOne({ where: { username: blockUserDto.initiatorLogin } });
		const userToUnblock: User = await this.usersRepository.findOne({ where: { username: blockUserDto.recipientLogin } });

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
		console.log(userID);
		return await this.usersRepository.findOne({ where: { id: userID } });
	}

	async getUserByLogin(loginToSearch: string): Promise<User> {
		// We search by login because it is unique
		return await this.usersRepository.findOne({ where: { login: loginToSearch } });
	}

	async getBlockedUserList(userID: number) {

		const user = await this.usersRepository.findOne({ where: { id: userID } });
		if (user) {
			return user.blockedUsers;
		}

		return [];
	}

	async getFriendships(username: string): Promise<Friendship[]> {

		const user: User = await this.usersRepository.findOne({ where: { username: username } });

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

		let array = [];
		const friendships = [...initiatedfriends, ...acceptedfriends];
		friendships.forEach((element: Friendship) => {
			let blockStatus = false;
			user.blockedUsers.forEach((blockedFriend: string) => {
				if (blockedFriend == (element.friend ? element.friend.username : element.initiator ? element.initiator.username : '')) {
					blockStatus = true;
				}
			});
			array.push({
				id: element.friend ? element.friend.id : element.initiator ? element.initiator.id : -1,
				username: element.friend ? element.friend.username : element.initiator ? element.initiator.username : 'unknown user',
				isBlocked: blockStatus,
			});
		});

		return array;
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
