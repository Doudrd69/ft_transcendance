import { Injectable, NotFoundException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult } from 'typeorm'
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

	async uploadAvatarURL(avatarURL: string, userID: number): Promise<UpdateResult | undefined> {
		try {
		const user = await this.getUserByID(userID);

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
	  
	updateUsername(login: string, newUsername: string) {
		this.getUserByLogin(login).then(userToUpdate => {
			userToUpdate.username = newUsername;
			return this.usersRepository.save(userToUpdate);
		}).catch(error => {
			console.log("Cannot update username :", error);
			throw new Error(error);
		});
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

	async createNew42User(userData) {
		const new42User = new User();
		new42User.login = userData.login;
		new42User.firstname = userData.firstname;
		new42User.officialProfileImage = userData.image;
		new42User.groups = [];
		return this.usersRepository.save(new42User);
	}


	/**************************************************************/
	/***				FRIENDSHIP MANAGEMENT					***/
	/**************************************************************/

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
	
	async updateFriendship(friendRequestDto: FriendRequestDto, flag: boolean): Promise<Friendship> {
		const initiator = await this.usersRepository.findOne({
		  where: { login: friendRequestDto.initiatorLogin },
		  relations: ["initiatedFriendships", "acceptedFriendships"],
		});
	  
		const friend = await this.usersRepository.findOne({
		  where: { login: friendRequestDto.recipientLogin },
		  relations: ["initiatedFriendships", "acceptedFriendships"],
		});
	  
		if (initiator && friend) {
		  const friendshipToUpdate = await this.friendshipRepository.findOne({
			where: { initiator: { id: initiator.id }, friend: { id: friend.id } },
		  });
	  
		  if (friendshipToUpdate) {
			friendshipToUpdate.isAccepted = flag;
			await this.friendshipRepository.save(friendshipToUpdate);
			console.log("Update -> ", friendshipToUpdate);
			return friendshipToUpdate;
		  }
		}
	  
		return null;
	}

	async acceptFriendship(friendRequestDto: FriendRequestDto) {

		const newFriend = await this.updateFriendship(friendRequestDto, true);
		if (newFriend) {
			console.log(friendRequestDto.initiatorLogin, " is now in your friend list!");
			return newFriend
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

	async getUserByID(userID: number): Promise<User> {
		return await this.usersRepository.findOne({ where: {id: userID}});
	}

	getUserByLogin(loginToSearch: string): Promise<User> {
		return this.usersRepository.findOne({ where: {login: loginToSearch}});
	}

	async getFriendships(username: string): Promise<Friendship[]> {
		const user = await this.usersRepository.findOne({
		  where: { login: username },
		  relations: ["initiatedFriendships", "initiatedFriendships.friend"],
		});
	  
		if (user) {
		  const friends = user.initiatedFriendships.filter((friendship) => friendship.isAccepted);
		  return friends;
		}
	  
		return [];
	  }
}