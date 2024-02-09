import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Conversation } from 'src/chat/entities/conversation.entity';
import { GroupMember } from 'src/chat/entities/group_member.entity';
import { Game } from 'src/game/entities/games.entity';
import { Repository, UpdateResult } from 'typeorm';
import { ChatService } from '../chat/chat.service';
import { BlockUserDto } from './dto/BlockUserDto.dto';
import { FriendRequestDto } from './dto/FriendRequestDto.dto';
import { UpdateUsernameDto } from './dto/UpdateUsernameDto.dto';
import { Friendship } from './entities/friendship.entity';
import { User } from './entities/users.entity';
import { DeleteFriendRequestDto } from './dto/DeleteFriendRequestDto.dto';
import { userInGame, userInMatchmaking } from 'src/game/matchmaking/matchmaking.service';

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

	async userInGame(userId: number) {
		// enelever les appels DB
		const user: User = await this.usersRepository.findOne({ where: { id: userId } })
		if (!user)
			throw new Error("userToInvite undefined")
			console.log(`[usersInGame] : userInGame[user1Id] : ${userInGame[userId]}, userInGame[user2Id] : ${userInGame[userId]}`)
			// console.log(`[usersInGame] : userInMatchmaking[user1Id] : ${userInMatchmaking[user1Id]}, userInMatchmaking[user2Id] : ${userInMatchmaking[user2Id]}`)
		if (userInGame[userId] === true || userInMatchmaking[userId] === true) {
			console.log(`usernametoinvite : game: ${user.inGame} match: ${user.inMatchmaking}`);
			return true;
		}
		return false;
	}

	usersInGame(user1Id: number, user2Id: number) {
		// enelever les appels DB
		console.log(`[usersInGame] : userInGame[user1Id] : ${userInGame[user1Id]}, userInGame[user2Id] : ${userInGame[user2Id]}`)
		console.log(`[usersInGame] : userInMatchmaking[user1Id] : ${userInMatchmaking[user1Id]}, userInMatchmaking[user2Id] : ${userInMatchmaking[user2Id]}`)
		if ((userInGame[user1Id] === true) || (userInMatchmaking[user1Id] === true)) {
			return true;
		}
		if ((userInGame[user2Id] === true) || (userInMatchmaking[user2Id] === true)) {
			return true;
		}
		return false;
	}

	async setUserInMatchmaking(userId: number) {
		// enelever les appels DB
		const user: User = await this.usersRepository.findOne({ where: { id: userId } })
		if (!user)
			throw new Error("user undefined")
		userInMatchmaking[userId] = true;
		user.inMatchmaking = true;
		await this.usersRepository.save(user);
	}
	async setUserInGame(userId: number) {
		// enelever les appels DB
		const user: User = await this.usersRepository.findOne({ where: { id: userId } })
		if (!user)
			throw new Error("user undefined")
		console.log(`[setUserInGame] GAME SET IN TRUE`)
		userInGame[userId] = true;
		user.inGame = true;
		await this.usersRepository.save(user);
	}

	async setUsersInGame(userId1: number, userId2: number) {
		// enelever les appels DB
		const user1: User = await this.usersRepository.findOne({ where: { id: userId1 } })
		if (!user1)
			throw new Error("user undefined")
		userInGame[userId1] = true;
		user1.inGame = true;
		const user2: User = await this.usersRepository.findOne({ where: { id: userId2 } })
		if (!user2)
			throw new Error("user undefined")
		userInGame[userId2] = true;
		user2.inGame = true;
		await this.usersRepository.save(user1);
		await this.usersRepository.save(user2);
	}

	async unsetUserInGame(userId: number) {
		const user: User = await this.usersRepository.findOne({ where: { id: userId } })
		if (!user)
			throw new Error("user undefined")
		userInGame[userId] = false;
		user.inGame = false;
		await this.usersRepository.save(user);
	}


	/**************************************************************/
	/***							2FA							***/
	/**************************************************************/

	async register2FATempSecret(userID: number, secret: string): Promise<boolean> {

		const userToUpdate = await this.usersRepository.findOne({ where: { id: userID } });
		if (userToUpdate) {
			userToUpdate.TFA_temp_secret = secret;
			await this.usersRepository.save(userToUpdate);
			return true;
		}

		return false;
	}

	async save2FASecret(user: User, code: string) {
		user.TFA_secret = code;
		await this.usersRepository.save(user);
		return ;
	}

	async upate2FAState(user: User, state: boolean) {
		user.TFA_isEnabled = state;
		await this.usersRepository.save(user);
		return ;
	}

	async get2faSecret(userID: number): Promise<string | null> {

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

		const user = await this.usersRepository.findOne({ where: { id: userID } });
		if (user) {

			const oldAvatarPath = join(__dirname, user.avatarURL);
			if (existsSync(oldAvatarPath))
				unlinkSync(oldAvatarPath);
			const updateResult = await this.usersRepository.update({ id: userID }, { avatarURL });
			return updateResult;
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
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
			throw new HttpException(`Invalid params`, HttpStatus.BAD_REQUEST);
		}
	}

	async getAvatar(userId: number): Promise<string | null> {
		const user = await this.usersRepository.findOne({ where: { id: userId } });
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

	// async deleteUser(username: string) {
	// 	const userToDelete = await this.usersRepository.findOne({ where: { username } });
	// 	if (userToDelete) {
	// 		return await this.usersRepository.delete(username);
	// 	}
	// 	throw new NotFoundException();
	// }

	// // Testing purpose - Maybe future implementation
	// async createNewUser(username: string): Promise<User> {
	// 	const userToCreate = await this.usersRepository.findOne({ where: { username: username } });
	// 	if (!userToCreate) {
	// 		// const saltOrRounds = 10;
	// 		// password = await bcrypt.hash(password, saltOrRounds);
	// 		// const isMatch = await bcrypt.compare(password, hash);
	// 		const newUser = new User();
	// 		newUser.login = username;
	// 		newUser.firstname = username;
	// 		newUser.username = username;
	// 		newUser.officialProfileImage = "";
	// 		return await this.usersRepository.save(newUser);
	// 	}
	// 	throw new HttpException(`Username already used`, HttpStatus.BAD_REQUEST);
	// }


	async updateUserStatus(userID: number, flag: boolean): Promise<User> {

		const user = await this.usersRepository.findOne({ where: { id: userID } });

		if (user) {
			user.isActive = flag;
			return await this.usersRepository.save(user);
		}

		throw new HttpException('User not found', HttpStatus.NOT_FOUND);
	}

	async createNew42User(userData): Promise<User> {
		const new42User = new User();
		new42User.login = userData.login;
		new42User.username = userData.login;
		new42User.firstname = userData.firstname;
		new42User.officialProfileImage = userData.image;
		new42User.groups = [];
		new42User.blockedUsers = [];
		return this.usersRepository.save(new42User);
	}

	async updateUsername(updateUsernameDto: UpdateUsernameDto, userID: number) {

		const user = await this.usersRepository.findOne({ where: { id: userID } });
		if (user) {

			const usernameValidation = await this.isUsernameValid(updateUsernameDto.newUsername);
			if (usernameValidation) {

				user.username = updateUsernameDto.newUsername;
				await this.usersRepository.save(user);
				return { newUsername: user.username };
			}

			throw new HttpException('Username is already used', HttpStatus.BAD_REQUEST);
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}

	async blockUser(blockUserDto: BlockUserDto, userID: number): Promise<number> {

		const user = await this.usersRepository.findOne({ where: { id: userID } });
		const userToBlock = await this.usersRepository.findOne({ where: { id: blockUserDto.recipientID } });

		if (user && userToBlock) {

			user.blockedUsers.forEach((id: number) => {
				if (id === userToBlock.id) {
					throw new HttpException('User is blocked', HttpStatus.BAD_REQUEST);
				}
			});

			user.blockedUsers.push(userToBlock.id);
			await this.usersRepository.save(user);
			return userToBlock.id;
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}

	async unblockUser(blockUserDto: BlockUserDto, userID: number): Promise<number> {

		const user: User = await this.usersRepository.findOne({ where: { id: userID } });
		const userToUnblock: User = await this.usersRepository.findOne({ where: { id: blockUserDto.recipientID } });

		if (user && userToUnblock) {
			const filter = user.blockedUsers.filter((user: number) => user != userToUnblock.id);
			user.blockedUsers = filter;
			await this.usersRepository.save(user);
			return userToUnblock.id;
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}



	/**************************************************************/
	/***				GAMES MANAGEMENT						***/
	/**************************************************************/

	async getUserGames(userID: number) {

		const user: User = await this.usersRepository.findOne({
			where: { id: userID },
		});

		if (user) {

			const userGames = await this.gameRepository
				.createQueryBuilder('game')
				.where('(game.userOneId = :id) OR (game.userTwoId = :id)', { id: user.id })
				.getMany()

			let array = [];
			userGames.forEach((game: Game) => {
				array.push({
					id: game.gameId,
					playerOne: game.playerOneLogin,
					playerTwo: game.playerTwoLogin,
					playerOneId: game.userOneId,
					playerTwoId: game.userTwoId,
					scoreP1: game.scoreOne,
					scoreP2: game.scoreTwo,
				});
			});

			if (array) {
				console.log(array);
				return array;
			}
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}

	async getUsersStats(userId: number) {

		const user = await this.usersRepository.findOne({ where: { id: userId } });

		if (user) {

			let object = {
				victory: user.victory,
				defeat: user.defeat,
				ratio: user.victory ? (user.victory / (user.defeat + user.victory) * 100) : 0,
			};

			return object;
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}

	/**************************************************************/
	/***				FRIENDSHIP MANAGEMENT					***/
	/**************************************************************/

	async createFriendship(friendRequestDto: FriendRequestDto, userID: number): Promise<boolean> {

		const initiator = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["initiatedFriendships"],
		});

		const recipient = await this.usersRepository.findOne({
			where: { username: friendRequestDto.recipientLogin },
			relations: ["initiatedFriendships"],
		});

		if (initiator && recipient) {

			if (initiator.id == recipient.id)
				throw new HttpException('Seriously?', HttpStatus.BAD_REQUEST);

			if (recipient.blockedUsers.find((user: number) => user === initiator.id))
				throw new HttpException(`${recipient.username} has blocked you`, HttpStatus.BAD_REQUEST);

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

			throw new HttpException(`${recipient.username} is already in your friend list`, HttpStatus.BAD_REQUEST);
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}

	async findDMConversation(user1: User, user2: User): Promise<Conversation> {

		let conversation : Conversation = null;
		user1.groups.forEach((userOneGroup: GroupMember) => {
			user2.groups.forEach((userTwoGroup: GroupMember) => {
				if ((userOneGroup.conversation.id == userTwoGroup.conversation.id) &&
					(!userOneGroup.conversation.is_channel && !userTwoGroup.conversation.is_channel)) {
					conversation = userOneGroup.conversation;
					return;
				}
			});
		});

		return conversation;
	}

	async updateFriendshipToTrue(friendRequestDto: FriendRequestDto, userID: number): Promise<Conversation | Friendship> {

		const initiator = await this.usersRepository.findOne({
			where: { id: friendRequestDto.initiatorID },
			relations: ["initiatedFriendships", "acceptedFriendships", "groups", "groups.conversation"],
		});

		const friend = await this.usersRepository.findOne({
			where: { id: userID },
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

				friendshipToUpdate.isAccepted = true;
				await this.friendshipRepository.save(friendshipToUpdate);

				const privateConversation = await this.findDMConversation(initiator, friend);

				if (!privateConversation) {
					const conversation = this.chatService.createDMConversation(initiator, friend);
					return conversation;
				}

				return friendshipToUpdate;
			}
		}

		throw new HttpException('User not found', HttpStatus.NOT_FOUND);
	}

	async deleteFriendRequest(dto: DeleteFriendRequestDto, userID: number) {

		const user: User = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["initiatedFriendships", "acceptedFriendships"],
		});

		const friend: User = await this.usersRepository.findOne({
			where: { id: dto.friendID },
			relations: ["initiatedFriendships", "acceptedFriendships"],
		});

		if (user && friend) {

			const friendshipToDelete = await this.friendshipRepository
				.createQueryBuilder('friendship')
				.where('(friendship.initiator.id = :initiatorId AND friendship.friend.id = :friendId) OR (friendship.initiator.id = :friendId AND friendship.friend.id = :initiatorId)', {
					initiatorId: friend.id,
					friendId: user.id,
				})
				.getOne();

			if (friendshipToDelete) {

				await this.friendshipRepository
					.createQueryBuilder()
					.delete()
					.from(Friendship)
					.where("id = :id", { id: friendshipToDelete.id })
					.execute();

				return;
			}

			throw new HttpException('Users are not friends', HttpStatus.NOT_FOUND);
		}

		throw new HttpException('User not found', HttpStatus.NOT_FOUND);
	}

	async acceptFriendship(friendRequestDto: FriendRequestDto, userID: number): Promise<Conversation | Friendship> {

		const newConversationBetweenFriends = await this.updateFriendshipToTrue(friendRequestDto, userID);
		if (newConversationBetweenFriends) {
			return newConversationBetweenFriends;
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}



	/**************************************************************/
	/***					GETTERS						***/
	/**************************************************************/

	async getUsername(userID: number): Promise<string> {

		const user = await this.usersRepository.findOne({ where: { id: userID } });
		if (user) {
			return user.username;
		}

		throw new HttpException('User not found', HttpStatus.NOT_FOUND);
	}

	async getUserByID(userID: number): Promise<User> {
		const user = await this.usersRepository.findOne({ where: { id: userID } });
		if (!user)
			throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
		return (user);
	}

	async getUserByLogin(loginToSearch: string): Promise<User> {
		
		return await this.usersRepository.findOne({ where: { login: loginToSearch } });
	}

	async getUserByUsername(usernameToSearch: string): Promise<User> {
		
		const user = await this.usersRepository.findOne({ where: { username: usernameToSearch } });
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return user;
	}

	async getBlockedUserList(userID: number) {

		const user = await this.usersRepository.findOne({ where: { id: userID } });
		if (user) {
			return user.blockedUsers;
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}


	async getUserList(userId: number) {
		const user = await this.usersRepository.findOne({ where: { id: userId } });

		if (user) {

			const users = await this.usersRepository.find();
			if (users && users.length > 0) {
		
				const array = users
					.filter((user_) => user_.id !== userId)
					.sort((a, b) => a.username.localeCompare(b.username))
					.map((user_: User) => {
						let blockStatus = false;

						user.blockedUsers.forEach((blockedFriend: number) => {
							if (blockedFriend === user_.id) {
								blockStatus = true;
							}
						});

						return {
							id: user_.id,
							username: user_.username,
							avatar: user_.avatarURL,
							isBlocked: blockStatus,
						};
					});

				return array;

			} else {
				throw new HttpException('User list is empty', HttpStatus.BAD_REQUEST);
			}
		} else {
			throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
		}
	}


	async getFriendships(userID: number): Promise<Friendship[]> {

		const user: User = await this.usersRepository.findOne({ where: { id: userID } });

		if (user) {

			const initiatedFriends = await this.friendshipRepository
				.createQueryBuilder('friendship')
				.innerJoinAndSelect('friendship.friend', 'friend')
				.where('friendship.initiator = :userId', { userId: user.id })
				.andWhere('friendship.isAccepted = true')
				.getMany();


			const acceptedFriends = await this.friendshipRepository
				.createQueryBuilder('friendship')
				.innerJoinAndSelect('friendship.initiator', 'initiator')
				.where('friendship.friend = :userId', { userId: user.id })
				.andWhere('friendship.isAccepted = true')
				.getMany();

			let array = [];
			const friendships = [...initiatedFriends, ...acceptedFriends];
			friendships.forEach((element: Friendship) => {
				let blockStatus = false;
				user.blockedUsers.forEach((blockedFriend: number) => {
					if (blockedFriend == (element.friend ? element.friend.id: element.initiator ? element.initiator.id : null)) {
						blockStatus = true;
					}
				});
				array.push({
					id: element.friend ? element.friend.id : element.initiator ? element.initiator.id : -1,
					username: element.friend ? element.friend.username : element.initiator ? element.initiator.username : 'unknown user',
					isBlocked: blockStatus,
					onlineStatus: element.friend ? element.friend.isActive : element.initiator ? element.initiator.isActive : false,
				});
			});

			return array;
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}

	async getPendingFriendships(userID: number): Promise<Friendship[]> {

		const user: User = await this.usersRepository.findOne({ where: { id: userID } });

		if (user) {

			const acceptedFriends = await this.friendshipRepository
				.createQueryBuilder('friendship')
				.innerJoinAndSelect('friendship.initiator', 'initiator')
				.where('friendship.friend = :userId', { userId: user.id })
				.andWhere('friendship.isAccepted != true')
				.getMany();

			let array = [];
			acceptedFriends.forEach((element: Friendship) => {
				let blockStatus = false;
				user.blockedUsers.forEach((blockedFriend: number) => {
					if (blockedFriend == (element.initiator.id)) {
						blockStatus = true;
					}
				});
				array.push({
					id: element.initiator.id,
					username: element.initiator.username,
					isBlocked: blockStatus,
					onlineStatus: element.initiator.isActive,
				});
			});

			return array;
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}
}
