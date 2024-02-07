import { Injectable, Inject, forwardRef, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { UpdateConversationDto } from './dto/UpdateConversationDto.dto';
import { AddUserToConversationDto } from './dto/addUserToConversationDto.dto';
import { UserOptionsDto } from './dto/userOptionsDto.dto';
import { CheckPasswordDto } from './dto/checkPasswordDto.dto';
import { ConversationDto } from './dto/conversation.dto';
import { MessageDto } from './dto/message.dto';
import { Conversation } from './entities/conversation.entity';
import { GroupMember } from './entities/group_member.entity';
import { Message } from './entities/message.entity';
import { group } from 'console';
import { ChannelOptionsDto } from './dto/channelOptionsDto.dto';
import { QuitConversationDto } from './dto/quitConversationDto.dto';
import { FormatInputPathObject } from 'path';
import { UpdateIsPublicDto } from './dto/updateIsPublicDto.dto';
import { UpdateProtectFalseDto } from './dto/updateProtectFalseDto.dto';
import { DeleteConversationDto } from './dto/deleteConversationDto.dto';
import { MuteUserDto } from './dto/muteUserDto.dto';
import { DMcreationDto } from './dto/DMcreationDto.dto';
import { UsersService } from 'src/users/users.service';
import { kickUserDto } from './dto/kickuserDto.dto';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Conversation)
		private conversationRepository: Repository<Conversation>,
		@InjectRepository(Message)
		private messageRepository: Repository<Message>,
		@InjectRepository(GroupMember)
		private groupMemberRepository: Repository<GroupMember>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@Inject(forwardRef(() => UsersService))
		private userService: UsersService,
	) {}

	/**************************************************************/
	/***						PRIVATE							***/
	/**************************************************************/

	/***					PRIVATE STATUS GETTERS				***/

	private async getRelatedGroup(user: User, conversation: Conversation): Promise<GroupMember> {

		// Groups linked to the conversation
		const groupList : GroupMember[] = await this.groupMemberRepository.find({
			where: { conversation: conversation },
		});

		let groupFound : GroupMember = null;
		user.groups.forEach((userGroup: GroupMember) => {
			groupList.forEach((group: GroupMember) => {
				if (userGroup.id == group.id) {
					console.log("Related group: ", group.id);
					groupFound = group;
				}
			});
		});

		return groupFound;
	}

	private async getGroupIsOwnerStatus(user: User, conversation: Conversation): Promise<boolean> {

		let status = false;
		user.groups.forEach((group: GroupMember) => {
			if (group.conversation.id == conversation.id) {
				if (group.isOwner) {
					status = true;
					return ;
				}
			}
		});

		return status;
	}

	private async getGroupIsAdminStatus(user: User, conversation: Conversation): Promise<boolean> {

		let status = false;
		user.groups.forEach((group: GroupMember) => {
			if (group.conversation.id == conversation.id) {
				if (group.isAdmin) {
					status = true;
					return ;
				}
			}
		});

		return status;
	}

	private async getGroupIsBanStatus(user: User, conversation: Conversation): Promise<boolean> {

		let status = false;
		user.groups.forEach((group: GroupMember) => {
			if (group.conversation.id == conversation.id) {
				if (group.isBan) {
					status = true;
					return ;
				}
			}
		});

		return status;
	}

	isUserMuted(group: GroupMember): boolean {
		// si user mute mais sans temps : return true
		return group.mutedUntil !== null && new Date() < group.mutedUntil;
	}

	private async getGroupIsMuteStatus(user: User, conversation: Conversation): Promise<boolean> {

		let status = false;
		let updateStatus = false;
		let groupToUpdate = null
		user.groups.forEach((group: GroupMember) => {
			if (group.conversation.id == conversation.id) {
				if (group.mutedUntil != null) {
					status = this.isUserMuted(group);
					if (!status) {
						updateStatus = true;
						groupToUpdate = group;
					}
				}
				else if (group.isMute) {
					status = true;
				}
			}
		});

		if (updateStatus) {
			groupToUpdate.isMute = false;
			groupToUpdate.mutedUntil = null;
			await this.groupMemberRepository.save(groupToUpdate);
		}

		return status;
	}

	/***					PASSWORD HANDLER				***/

	private async hashChannelPassword(password: string) {

		if (!password)
			return password;
	
		const saltOrRounds = 10;
		const hash = await bcrypt.hash(password, saltOrRounds);
		return hash;
	}

	/***					VARIOUS GETTERS					***/

	private async getUserListFromConversations(user: User, conversationList: Conversation[]) {

		const users = await this.usersRepository.find({
			relations: ["groups", "groups.conversation"],
		});

		if (users) {
			
			let array = [];
			user.groups.forEach((userGroup: GroupMember) => {
				if (userGroup.conversation.is_channel) {
					let userListForThisGroup = [];
					users.forEach((user_: User) => {
							user_.groups.forEach((group: GroupMember) => {
								if (group.conversation.id == userGroup.conversation.id) {
									if (group.conversation.is_channel)
										userListForThisGroup.push({
											id: user_.id,
											login: user_.username,
											avatarURL: user_.avatarURL,
											isOwner: group.isOwner,
											isAdmin: group.isAdmin,
											isBan: group.isBan,
											isMute: group.isMute,
											blockList: user_.blockedUsers,
										});
								}
							});
					});
					array.push(userListForThisGroup);
				}
			});
				
			return array;
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}

	private async getUserListFromTargetConversation(conversationID: number) {

		const users = await this.usersRepository.find({
			relations: ["groups", "groups.conversation"],
		});

		const conversation = await this.conversationRepository.findOne({ where: { id: conversationID } });
		if (!conversation) {
			return [];
		}

		let array = [];
		users.forEach((user_: User) => {
			user_.groups.forEach((group: GroupMember) => {
				if (group.conversation.id == conversationID) {
					if (group.conversation.is_channel) {
						array.push({
							login: user_.login,
							avatarURL: user_.avatarURL,
							isAdmin: group.isAdmin,
							isMute: group.isMute,
							isOwner: group.isOwner,
							isBan: group.isBan,
							id: user_.id,
							blockList: user_.blockedUsers,
						});
					}
				}
			});
		});

		return array;
	}

	private async getAllMessages(conversationID: number, userID: number): Promise<Message[]> {

		const conversation = await this.conversationRepository.findOne({ where: {id: conversationID} });
		
		const user : User = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ['groups', 'groups.conversation'],
		});

		if (user && conversation) {
			
			const group = await this.getRelatedGroup(user, conversation)
			if (group) {

				const messages = await this.messageRepository.find({ where: {conversation: conversation}});
				const filteredMessages = messages.filter((message: Message) => !user.blockedUsers.includes(message.from));
				return filteredMessages;
			}

			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		}
		
		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}

	private async getAllChannels(userID: number): Promise<Conversation[]> {
		
		
		const userToFind : User = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		});
		
		if (userToFind) {
			
			let conversationArray : Conversation[] = [];
			if (userToFind.groups && Array.isArray(userToFind.groups)) {
				userToFind.groups.forEach((group: GroupMember) => {
					if (group.conversation.is_channel && !group.isBan)
						conversationArray.push(group.conversation)
				})
				return conversationArray;
			}
			return [];
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}

	async getUserListFromDms(userID: number) {

		const myuser = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ['groups', 'groups.conversation'],
		});

		if (myuser) {

			// les dms = group.conversation -->!is_channel
			let userDMs = [];
			myuser.groups.forEach((group: GroupMember) => {
				if (!group.conversation.is_channel) {
					userDMs.push(group.conversation);
				}
			});
	
			const users = await this.usersRepository.find({
				relations: ['groups', 'groups.conversation'],
			});
	
			if (users) {

				let DMList = [];
				users.forEach((user: User) => {
					// tout les groups d'un user
					if (user.id != myuser.id) {
						user.groups.forEach((userGroup: GroupMember) => {
							// chaque groupe du user par rapport a NOS groups de DM
							userDMs.forEach((dm: Conversation) => {
								// Si on a une conv privee
								if (userGroup.conversation.id == dm.id) {
									DMList.push({
										id: userGroup.conversation.id,
										username: user.username,
										avatarURL: user.avatarURL,
										userID: user.id,
										name: userGroup.conversation.name,
										onlineStatus: user.isActive,
									});
								}
							})
						});
					}
				});

				return DMList;
			}
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}

	private async getDMsConversations(userID: number): Promise<Conversation[]> {
		
		
		const userToFind : User = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		});
		
		if (userToFind) {
			
			let conversationArray : Conversation[] = [];
			if (userToFind.groups && Array.isArray(userToFind.groups)) {
				userToFind.groups.forEach((group: GroupMember) => {
					if (!group.conversation.is_channel)
						conversationArray.push(group.conversation)
				})
				return conversationArray;
			}
			return [];
		}
		console.error("Fatal error2: user not found");
		return [];
	}

	
	async getAllConversations(userID: number): Promise<Conversation[]> {
		
		const userToFind : User = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		});
		
		if (userToFind) {
			
			let conversationArray : Conversation[] = [];
			if (userToFind.groups && Array.isArray(userToFind.groups)) {
				userToFind.groups.forEach((group: GroupMember) => {
					if (!group.isBan)
						conversationArray.push(group.conversation)
				})
				return conversationArray;
			}
			return [];
		}

		throw new HttpException('User not found', HttpStatus.NOT_FOUND);
	}



	/**************************************************************/
	/***					CHANNEL PASSWORD					***/
	/**************************************************************/

	async compareChannelPassword(checkPasswordDto: CheckPasswordDto, userID: number): Promise<boolean> {

		const conversation : Conversation = await this.conversationRepository.findOne({ where: { id: checkPasswordDto.conversationID} });
		if (conversation && conversation.isProtected) {
			const isMatch = await bcrypt.compare(checkPasswordDto.userInput, conversation.password);
			if (isMatch) {

				const conversationToAdd = await this.addUserToConversation(conversation.id, userID, true, true);
				if (conversationToAdd)
					return true;
				else
					throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
			}

			throw new HttpException('Wrong password', HttpStatus.BAD_REQUEST);
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}



	/**************************************************************/
	/***						GROUP							***/
	/**************************************************************/

	async createGroup(conversation: Conversation, isAdminFlag: boolean, isOwnerFlag: boolean): Promise<GroupMember> {
		
		console.log("Creating group...");
		const group = new GroupMember();
		group.isOwner = isOwnerFlag;
		group.isAdmin = isAdminFlag;
		group.joined_datetime = new Date();
		group.conversation = conversation;
		return await this.groupMemberRepository.save(group);
	}



	/**************************************************************/
	/***						CHANNEL OPTIONS					***/
	/**************************************************************/

	async updateChannelPublicStatusToTrue(updateIsPublicDto: UpdateIsPublicDto, userID: number): Promise<boolean> {

		const user : User = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		});

		const channelToUpdate : Conversation = await this.conversationRepository.findOne({
			where: { id: updateIsPublicDto.conversationID },
		});

		if (user && channelToUpdate) {

			const isUserIsAdmin = await this.getGroupIsAdminStatus(user, channelToUpdate);
	
			if (isUserIsAdmin) {

				channelToUpdate.isPublic = true;
				await this.conversationRepository.save(channelToUpdate);
				return true;
			}
	
			throw new HttpException(`${user.username} is not admin`, HttpStatus.BAD_REQUEST);
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}

	async updateChannelPublicStatusToFalse(updateIsPublicDto: UpdateIsPublicDto, userID: number): Promise<boolean> {

		const user : User = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		});

		const channelToUpdate : Conversation = await this.conversationRepository.findOne({
			where: { id: updateIsPublicDto.conversationID },
		});

		if (user && channelToUpdate) {

			const isUserIsAdmin = await this.getGroupIsAdminStatus(user, channelToUpdate);
	
			if (isUserIsAdmin) {

				channelToUpdate.isPublic = false;
				await this.conversationRepository.save(channelToUpdate);
				return true;
			}
	
			throw new HttpException(`${user.username} is not admin`, HttpStatus.BAD_REQUEST);
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}


	async updateChannelIsProtectedStatusToTrue(channelOptionsDto: ChannelOptionsDto, userID: number): Promise<boolean> {

		const user : User = await this.usersRepository.findOne({
			where: { id: userID},
			relations: ["groups", "groups.conversation"],
		});

		const channelToUpdate : Conversation = await this.conversationRepository.findOne({
			where: { id: channelOptionsDto.conversationID },
		});

		if (user && channelToUpdate) {

			const isUserIsAdmin = await this.getGroupIsAdminStatus(user, channelToUpdate);
	
			if (isUserIsAdmin) {

				channelToUpdate.isProtected = true;
				channelToUpdate.password = await this.hashChannelPassword(channelOptionsDto.password)
				await this.conversationRepository.save(channelToUpdate);
				return true;
			}
			
			throw new HttpException(`${user.username} is not admin`, HttpStatus.BAD_REQUEST);
		}

		throw new HttpException('Data cannot be loaded', HttpStatus.BAD_REQUEST);
	}

	async updateChannelIsProtectedStatusToFalse( updateProtectFalseDto: UpdateProtectFalseDto, userID: number): Promise<boolean> {

		const user : User = await this.usersRepository.findOne({
			where: { id: userID},
			relations: ["groups", "groups.conversation"],
		});

		const channelToUpdate : Conversation = await this.conversationRepository.findOne({
			where: { id: updateProtectFalseDto.conversationID },
		});

		if (user && channelToUpdate) {

			const isUserIsAdmin = await this.getGroupIsAdminStatus(user, channelToUpdate);
	
			if (isUserIsAdmin) {

				channelToUpdate.isProtected = false;
				channelToUpdate.password = "";
				await this.conversationRepository.save(channelToUpdate);
				return true;
			}
	
			throw new HttpException(`${user.username} is not admin`, HttpStatus.BAD_REQUEST);
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}



	/**************************************************************/
	/***					USER CHANNEL OPTIONS				***/
	/**************************************************************/

	async updateUserMuteStatusFromConversation(muteUserDto: MuteUserDto, userID: number): Promise<boolean> {

		const userToMute : User = await this.usersRepository.findOne({
			where: { username: muteUserDto.username },
			relations: ["groups"],
		});

		const user = await this.usersRepository.findOne({ where: { id: userID } });
		const conversation = await this.conversationRepository.findOne({ where: { id: muteUserDto.conversationID } });

		if (userToMute && user && conversation) {

			const userGroup = await this.getRelatedGroup(user, conversation);
			if (userGroup) {

				if (userGroup.isBan)
					throw new HttpException(`${user.username} is ban from this channel`, HttpStatus.BAD_REQUEST);
		
				const groupToUpdate = await this.getRelatedGroup(userToMute, conversation);
				if (groupToUpdate) {

					if (groupToUpdate.isBan)
						throw new HttpException(`${userToMute.username} is ban from this channel`, HttpStatus.BAD_REQUEST);
			
					groupToUpdate.isMute = true;
					const currentDate = new Date();
					const mutedUntil = new Date(currentDate.getTime() + muteUserDto.mutedUntil * 60000);
					groupToUpdate.mutedUntil = mutedUntil;
					await this.groupMemberRepository.save(groupToUpdate);
					return true;
				}
			}
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}

	async updateUserUnmuteStatusFromConversation(muteUserDto: UserOptionsDto, userID: number): Promise<boolean> {

		const userToMute : User = await this.usersRepository.findOne({
			where: { id: muteUserDto.target },
			relations: ["groups"],
		});

		const user = await this.usersRepository.findOne({ where: { id: userID } });
		const conversation = await this.conversationRepository.findOne({ where: { id: muteUserDto.conversationID } });

		if (userToMute && user && conversation) {

			const userGroup = await this.getRelatedGroup(user, conversation);
			if (userGroup) {

				if (userGroup.isBan)
					throw new HttpException(`${user.username} is ban from this channel`, HttpStatus.BAD_REQUEST);
		
				const groupToUpdate = await this.getRelatedGroup(userToMute, conversation);
				if (groupToUpdate) {

					if (groupToUpdate.isBan)
						throw new HttpException(`${userToMute.username} is ban from this channel`, HttpStatus.BAD_REQUEST);
	
					groupToUpdate.isMute = false;
					groupToUpdate.mutedUntil = null;
					await this.groupMemberRepository.save(groupToUpdate);
					return true;	
				}
			}
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}

	async updateUserBanStatusFromConversation(banUserDto: UserOptionsDto, userID: number): Promise<boolean> {

		const userToBan : User = await this.usersRepository.findOne({
			where: { id: banUserDto.target },
			relations: ["groups"],
		});

		const user = await this.usersRepository.findOne({ where: { id: userID} });
		const conversation = await this.conversationRepository.findOne({ where: { id: banUserDto.conversationID } });

		if (userToBan && user && conversation) {

			const userGroup = await this.getRelatedGroup(user, conversation);
			if (userGroup) {

				if (userGroup.isBan)
					throw new HttpException(`${user.username} is ban from this channel`, HttpStatus.BAD_REQUEST);
		
				const groupToUpdate = await this.getRelatedGroup(userToBan, conversation);
				if (groupToUpdate) {
					
					if (groupToUpdate.isBan)
						throw new HttpException(`${userToBan.username} is ban from this channel`, HttpStatus.BAD_REQUEST);
			
					if (userGroup.isOwner || userGroup.isAdmin) {

						if (!groupToUpdate.isOwner || !groupToUpdate.isAdmin) {
							groupToUpdate.isBan = true;
							await this.groupMemberRepository.save(groupToUpdate);
							return true;
						}
	
						throw new HttpException(`${userToBan.username} has higher privilege`, HttpStatus.BAD_REQUEST);
					}

					throw new HttpException(`${user.username} is not owner or admin`, HttpStatus.BAD_REQUEST);
				}
			}
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}

	async updateUserUnbanStatusFromConversation(banUserDto: UserOptionsDto, userID: number): Promise<boolean> {

		const userToUnban : User = await this.usersRepository.findOne({
			where: { id: banUserDto.target },
			relations: ["groups"],
		});

		const user = await this.usersRepository.findOne({ where: { id: userID} });
		const conversation = await this.conversationRepository.findOne({ where: { id: banUserDto.conversationID } });

		if (userToUnban && user && conversation) {

			const userGroup = await this.getRelatedGroup(user, conversation);
			if (userGroup) {

				if (userGroup.isBan)
					throw new HttpException(`${user.username} is ban from this channel`, HttpStatus.BAD_REQUEST);

				const groupToUpdate = await this.getRelatedGroup(userToUnban, conversation);
				if (groupToUpdate) {

					if (userGroup.isOwner || userGroup.isAdmin) {

						if (!groupToUpdate.isOwner || !groupToUpdate.isAdmin) {
							groupToUpdate.isBan = false;
							await this.groupMemberRepository.save(groupToUpdate);
							return true;
						}
			
						throw new HttpException(`${userToUnban.username} has higher privilege`, HttpStatus.BAD_REQUEST);
					}
		
					throw new HttpException(`${user.username} is not owner or admin`, HttpStatus.BAD_REQUEST);
				}
			}
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}

	async updateUserAdminStatusFromConversationTrue(promoteUserToAdminDto: UserOptionsDto, userID: number): Promise<boolean> {

		const userToPromote : User = await this.usersRepository.findOne({
			where: { id: promoteUserToAdminDto.target },
			relations: ['groups'],
		});

		const user = await this.usersRepository.findOne({ where: { id: userID } });
		if (user.id == userToPromote.id)
			return false;

		const conversation = await this.conversationRepository.findOne({ where: { id: promoteUserToAdminDto.conversationID } });
		
		if (userToPromote && user && conversation) {

			const userGroup = await this.getRelatedGroup(user, conversation);
			if (userGroup) {

				if (userGroup.isBan)
					throw new HttpException(`${user.username} is ban from this channel`, HttpStatus.BAD_REQUEST);

				const groupToUpdate = await this.getRelatedGroup(userToPromote, conversation);
				if (groupToUpdate) {

					if (groupToUpdate.isBan)
						throw new HttpException(`${userToPromote.username} is ban from this channel`, HttpStatus.BAD_REQUEST);
			
					if (userGroup.isOwner || userGroup.isAdmin) {
						if (!groupToUpdate.isOwner || !groupToUpdate.isAdmin) {
							groupToUpdate.isAdmin = true;
							await this.groupMemberRepository.save(groupToUpdate);
							return true;
						}
			
						throw new HttpException(`${userToPromote.username} has higher privilege`, HttpStatus.BAD_REQUEST);
					}

					throw new HttpException(`${user.username} is not owner or admin`, HttpStatus.BAD_REQUEST);
				}
			}
		}

		throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
	}

	async updateUserAdminStatusFromConversationFalse(promoteUserToAdminDto: UserOptionsDto, userID: number): Promise<boolean> {

		const userToPromote : User = await this.usersRepository.findOne({
			where: { id: promoteUserToAdminDto.target },
			relations: ['groups'],
		});

		const user = await this.usersRepository.findOne({ where: { id: userID } });
		const conversation = await this.conversationRepository.findOne({ where: { id: promoteUserToAdminDto.conversationID } });
		
		if (userToPromote && user && conversation) {

			const userGroup = await this.getRelatedGroup(user, conversation);
			if (userGroup) {

				if (userGroup.isBan)
					throw new HttpException(`${user.username} is ban from this channel`, HttpStatus.BAD_REQUEST);
		
				const groupToUpdate = await this.getRelatedGroup(userToPromote, conversation);
				if (groupToUpdate) {

					if (groupToUpdate.isBan)
						throw new HttpException(`${userToPromote.username} is ban from this channel`, HttpStatus.BAD_REQUEST);
			
					if (userGroup.isOwner || userGroup.isAdmin) {
						if (!groupToUpdate.isOwner || !groupToUpdate.isAdmin) {
							groupToUpdate.isAdmin = false;
							await this.groupMemberRepository.save(groupToUpdate);
							return true;
						}
	
						throw new HttpException(`${userToPromote.username} has higher privilege`, HttpStatus.BAD_REQUEST);
					}

					throw new HttpException(`${user.username} is not owner or admin`, HttpStatus.BAD_REQUEST);
				}
			}
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}



	/**************************************************************/
	/***					CONVERSATION						***/
	/**************************************************************/
	
	async isUserInConversation(userID: number, conversationID: number): Promise<User> {

		const conversation: Conversation = await this.conversationRepository.findOne({ where: { id: conversationID } });

		const user : User = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ['groups', 'groups.conversation'],
		});

		if (user && conversation) {

			const group = await this.getRelatedGroup(user, conversation);
			if (group)
				return user;

			throw new HttpException('User is not in conversation', HttpStatus.NOT_FOUND);
		}

		throw new HttpException('User or Channel cannot be loaded', HttpStatus.NOT_FOUND);
	}

	async deleteConversation(deleteConversationDto: DeleteConversationDto, userID: number): Promise<boolean> {

		const conversationToDelete: Conversation = await this.conversationRepository.findOne({ where: { id: deleteConversationDto.conversationID } });

		const user = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ['groups', 'groups.conversation'],
		});

		if (user && conversationToDelete) {

			const userGroup = await this.getRelatedGroup(user, conversationToDelete);
			if (userGroup) {

				if (userGroup.isOwner) {

					const idToDelete = conversationToDelete.id;
		
					await this.groupMemberRepository
						  .createQueryBuilder()
						  .delete()
						  .from(GroupMember)
						 .where("conversation.id = :id", { id: idToDelete })
						  .execute();
		
					await this.conversationRepository
						.createQueryBuilder()
						.delete()
						.from(Message)
						.where("conversation.id = :id", { id: conversationToDelete.id })
						.execute()
		
					await this.conversationRepository
						.createQueryBuilder()
						.delete()
						.from(Conversation)
						.where("id = :id", { id: conversationToDelete.id })
						.execute()
		
					return true ;
				}

				throw new HttpException('User is not the owner', HttpStatus.BAD_REQUEST);
			}

			throw new HttpException('User is not in this conversation', HttpStatus.BAD_REQUEST);
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}

	async promoteNewOwner(conversation: Conversation): Promise<boolean> {

		let groupToPromote : GroupMember;
		const relatedGroups: GroupMember[] = await this.groupMemberRepository.find({ where: { conversation: conversation} });
		if (relatedGroups) {
			relatedGroups.forEach((group: GroupMember) => {
				if (!group.isBan) {
					groupToPromote = group;
					return ;
				}
			});
			if (groupToPromote) {
				groupToPromote.isOwner = true;
				groupToPromote.isAdmin = true;
				await this.groupMemberRepository.save(groupToPromote);
	
				return true;
			}
		}

		await this.conversationRepository
			.createQueryBuilder()
			.delete()
			.from(Message)
			.where("conversation.id = :id", { id: conversation.id })
			.execute()

		await this.conversationRepository
			.createQueryBuilder()
			.delete()
			.from(Conversation)
			.where("id = :id", { id: conversation.id })
			.execute()

		return false;
	}

	async quitConversation(quiConversationDto: QuitConversationDto, userID: number): Promise<boolean> {

		const user : User = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		});

		const conversation : Conversation = await this.conversationRepository.findOne({
			where: { id: quiConversationDto.conversationID },
		});

		if (user && conversation) {

			const groupToRemove = await this.getRelatedGroup(user, conversation);
			if (groupToRemove) {

				if (groupToRemove.isBan)
					throw new HttpException(`${user.username} is ban from this channel`, HttpStatus.BAD_REQUEST);
	
				const isOwnerStatus = await this.getGroupIsOwnerStatus(user, conversation);
				
				if (groupToRemove) {
					const newGroups = user.groups.filter((group: GroupMember) => group.id != groupToRemove.id);
					user.groups = newGroups;
					await this.usersRepository.save(user);

					await this.groupMemberRepository
						.createQueryBuilder()
						.delete()
						.from(GroupMember)
						.where("id = :id", { id: groupToRemove.id })
						.execute()
	
					if (isOwnerStatus) {
						const status = await this.promoteNewOwner(conversation);
					}
	
					return true;
				}
			}

			throw new HttpException('User is not in this conversation', HttpStatus.BAD_REQUEST);
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}

	async kickUserFromConversation(kickUserDto: kickUserDto, userID: number) {


		const userToKick : User = await this.usersRepository.findOne({
			where: { id: kickUserDto.userToKickID },
			relations: ["groups", "groups.conversation"],
		});

		const userInitiator : User = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		}); 

		const conversation : Conversation = await this.conversationRepository.findOne({
			where: { id: kickUserDto.conversationID },
		});

		if (userToKick && userInitiator && conversation) {

			const kickGroup = await this.getRelatedGroup(userToKick, conversation);
			const initiatorGroup = await this.getRelatedGroup(userInitiator, conversation); 
			if (kickGroup && initiatorGroup && initiatorGroup.isAdmin) {
				if (kickGroup && !kickGroup.isOwner) {
					const dto : QuitConversationDto = {
						conversationID: conversation.id,
						userID: userToKick.id,
					}
					return await this.quitConversation(dto, userToKick.id);
				}
				throw new HttpException(`${userToKick.username} is the owner`, HttpStatus.BAD_REQUEST);
			}
			throw new HttpException(`You are not admin`, HttpStatus.BAD_REQUEST);
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}

	async addUserToConversation(conversationToAddId: number, userID: number, inviteFlag: boolean, passwordCheck: boolean): Promise<Conversation> {
		
		const userToAdd = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ['groups', 'groups.conversation'],
		});
		
		const conversationToAdd = await this.conversationRepository.findOne({
			where: { id: conversationToAddId },
		});

		if (conversationToAdd.isProtected && !passwordCheck && !inviteFlag)
			throw new HttpException(`Channel is protected: you need the password`, HttpStatus.BAD_REQUEST);

		if (!conversationToAdd.isPublic && !inviteFlag)
			throw new HttpException(`Channel is private: you need an invitation`, HttpStatus.BAD_REQUEST);

		if (userToAdd && conversationToAdd) {

			const isGroupInUsersArray = await this.getRelatedGroup(userToAdd, conversationToAdd);
			if (isGroupInUsersArray)
				throw new HttpException(`User has already joined the conversation`, HttpStatus.BAD_REQUEST);
	
			if (await this.getGroupIsBanStatus(userToAdd, conversationToAdd))
				throw new HttpException(`User is ban from this channel`, HttpStatus.BAD_REQUEST);

			const group = new GroupMember();
			group.isAdmin = false;
			group.joined_datetime = new Date();
			group.conversation = conversationToAdd;
			await this.groupMemberRepository.save(group);
				
			if (group) {
				userToAdd.groups.push(group);
				await this.usersRepository.save(userToAdd);
				return conversationToAdd;
			}
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}
	
	async createDMConversation(initiator: User, friend: User): Promise<Conversation> {
		
		// We first check if there is not already a conversation between the two users
		const conversationCheck = await this.userService.findDMConversation(initiator, friend);
		// If not, we can create the DM conversation
		if (!conversationCheck) {

			const room = new Conversation();
			room.name = initiator.username + friend.username;
			room.is_channel = false;
			await this.conversationRepository.save(room);
			
			if (room) {
				
				const roomGroupInitiator = new GroupMember();
				roomGroupInitiator.isAdmin = false;
				roomGroupInitiator.joined_datetime = new Date();
				roomGroupInitiator.conversation = room;
				await this.groupMemberRepository.save(roomGroupInitiator);
				
				const roomGroupFriend = new GroupMember();
				roomGroupFriend.isAdmin = false;
				roomGroupFriend.joined_datetime = new Date();
				roomGroupFriend.conversation = room;
				await this.groupMemberRepository.save(roomGroupFriend);
				
				if (roomGroupInitiator && roomGroupFriend) {
					
					friend.groups.push(roomGroupFriend);
					await this.usersRepository.save(friend);
					
					initiator.groups.push(roomGroupInitiator);
					await this.usersRepository.save(initiator);
					
					return room;
				}
			}
		}
		
		return conversationCheck;
	}

	// attention ordre userID et user2 mdr
	async createPrivateConversation(DMcreationDto: DMcreationDto, userID: number): Promise<Conversation> {

		const user1 = await this.usersRepository.findOne({
			where: { id: DMcreationDto.user1 },
			relations: ['groups', 'groups.conversation'],
		});

		const user2 = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ['groups', 'groups.conversation'],
		});

		if (user1 && user2) {
			const dm = await this.createDMConversation(user1, user2);
			if (dm)
				return dm;

				throw new HttpException('Data loading failed', HttpStatus.BAD_REQUEST);
		}

		throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}
	
	// Let admins update conversation to private/public and add/remove password
	// async updateConversation(updateConversationDto: UpdateConversationDto, userID: number): Promise<Conversation> {
		
	// 	const conversationToUpdate = await this.conversationRepository.findOne({ where: { id: updateConversationDto.conversationID} });
	// 	const user = await this.usersRepository.findOne({
	// 		where: { id: userID },
	// 		relations: ["groups", "groups.conversation"],
	// 	});

	// 	if (user && conversationToUpdate) {
			
	// 		const adminStatus = await this.getGroupIsAdminStatus(user, conversationToUpdate);

	// 		if (adminStatus) {

	// 			conversationToUpdate.isPublic = updateConversationDto.isPublic;
	// 			conversationToUpdate.isProtected = updateConversationDto.isProtected;
	// 			if (updateConversationDto.newPassword)
	// 				conversationToUpdate.password = await this.hashChannelPassword(updateConversationDto.newPassword);
	// 			return await this.conversationRepository.save(conversationToUpdate);
	// 		}
			
	// 		throw new HttpException(`User is not admin`, HttpStatus.BAD_REQUEST);
	// 	}
		
	// 	throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	// }
	
	async createConversation(conversationDto: ConversationDto, userID: number): Promise<Conversation> {
		
		const user = await this.usersRepository.findOne({
			where: { id: userID},
			relations: ['groups', 'groups.conversation'],
		});

		if (user) {
			
			const conv = new Conversation();
			conv.name = conversationDto.name;
			conv.is_channel = conversationDto.is_channel;
			conv.isPublic = conversationDto.isPublic;
			conv.isProtected = conversationDto.isProtected;

			if (!conversationDto.password && conversationDto.isProtected)
				throw new HttpException('Please enter a password', HttpStatus.BAD_REQUEST);

			if (conversationDto.password)
				conv.password = await this.hashChannelPassword(conversationDto.password);

			await this.conversationRepository.save(conv);
			
			// The user who created the conversation is set to admin
			const group = await this.createGroup(conv, true, true);
			if (group) {
				
				user.groups.push(group);
				await this.usersRepository.save(user);
				return conv;
			}

			throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
		}

		throw new HttpException('Fatal error: user not found', HttpStatus.BAD_REQUEST);
	}



	/**************************************************************/
	/***						MESSAGE							***/
	/**************************************************************/

	// need to check muteStatus here or in front?
	async createMessage(messageDto: MessageDto, userID: number): Promise<Message> {
	
		const conversation : Conversation = await this.conversationRepository.findOne({ where: {id: messageDto.conversationID} });
		const sender : User = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		});

		if (conversation && sender) {
			
			const userGroup = await this.getRelatedGroup(sender, conversation);
			if (!userGroup)
				throw new HttpException(`User is not in channel`, HttpStatus.BAD_REQUEST);
	
			const isMuteStatus = await this.getGroupIsMuteStatus(sender, conversation);
			if (isMuteStatus)
				throw new HttpException(`User is muted`, HttpStatus.BAD_REQUEST);
	
			const isBanStatus = await this.getGroupIsBanStatus(sender, conversation);
			if (isBanStatus)
				throw new HttpException(`User is ban`, HttpStatus.BAD_REQUEST);
	
			const newMessage = new Message();
			newMessage.from = sender.username;
			newMessage.senderId = sender.id;
			newMessage.content = messageDto.content;
			newMessage.post_datetime = messageDto.post_datetime;
			newMessage.conversation = conversation;
				
			return await this.messageRepository.save(newMessage);
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}

	async saveNotification(dto: any) {
		const conversation : Conversation = await this.conversationRepository.findOne({ where: {id: dto.channelID} });
		
		if (conversation) {
			const newMessage = new Message();
			newMessage.from = 'Bot';
			newMessage.senderId = 0;
			newMessage.content = dto.content;
			newMessage.post_datetime = dto.post_datetime;
			newMessage.conversation = conversation;
			return await this.messageRepository.save(newMessage);
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}

	/**************************************************************/
	/***						GETTERS							***/
	/**************************************************************/

	async getAllPublicConversations(): Promise<Conversation[]> {

		const publicConversations = await this.conversationRepository.find({
			where: {isPublic: true},
		});

		if (publicConversations) {
			return publicConversations;
		}

		throw new HttpException(`No conversations found`, HttpStatus.BAD_REQUEST);
	}
	
	async getAllPrivateConversations(): Promise<Conversation[]> {

		const publicConversations = await this.conversationRepository.find({
			where: {isPublic: false},
		});

		if (publicConversations) {
			return publicConversations;
		}

		throw new HttpException(`No conversations found`, HttpStatus.BAD_REQUEST);
	}
	

	getMessageById(idToFind: number) {
		return this.messageRepository.findOne({ where: {id: idToFind} });
	}

	async getConversationByID(id: number): Promise<Conversation> {

		const conversation = await this.conversationRepository.findOne({ where: {id: id} });
		if (conversation) {
			return conversation;
		}

		throw new HttpException(`No conversations found`, HttpStatus.BAD_REQUEST);
	}

	async getConversationByName(name: string): Promise<Conversation> {

		const conversation = await this.conversationRepository.findOne({ where: {name: name} });
		if (conversation) {
			return conversation;
		}

		throw new HttpException(`No conversations found`, HttpStatus.BAD_REQUEST);
	}

	async getConversationArrayByID(IDs: number[]): Promise<Conversation[]> {

		let conversations = <Conversation[]>[];

		for (let i = 0; i < IDs.length; i++) {
			const conversation = await this.getConversationByID(IDs[i]);
			conversations.push(conversation);
		}

		return conversations;
	}

	async getMessages(conversationID: number, userID: number): Promise<Message[]> {

		const allMessages = await this.getAllMessages(conversationID, userID);
		if (!allMessages) {
			console.error("Fatal error: messsages not found");
			return [];
		}

		return allMessages;
	}

	async getAllChannelsFromUser(userID: number): Promise<Conversation[]> {

		const allConversations = await this.getAllChannels(userID);
		if (!allConversations) {
			console.error("Fatal error: conversations not found");
			return [];
		}

		return allConversations;
	}

	async getDMsConversationsFromUser(userID: number): Promise<Conversation[]> {

		const allFriendConversations = await this.getDMsConversations(userID);
		if (!allFriendConversations) {
			console.error("Fatal error: conversations not found");
			return [];
		}

		return allFriendConversations;
	}

	async getUserList(conversationID: number) {

		return await this.getUserListFromTargetConversation(conversationID);
	}


	async getConversationsWithStatus(userID: number) {

		const user = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		});

		if (user) {

			let isAdminArray = [];
			user.groups.forEach((group: GroupMember) => {
				if (group.conversation.is_channel)
					isAdminArray.push(group.isAdmin);
			});

			const conversationList = await this.getAllChannels(userID);
			const usersList = await this.getUserListFromConversations(user, conversationList);

			if (conversationList && usersList) {
				const conversationArray = {
					conversationList: conversationList,
					isAdmin: isAdminArray,
					usersList: usersList,
					blockList: user.blockedUsers,
				}

				return conversationArray;
			}
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}

	async getConversationsToAdd(friendID: number, userID: number) {

		const user = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		});

		const friend = await this.usersRepository.findOne({
			where: { id: friendID },
			relations: ["groups", "groups.conversation"],
		});

		let conversations : Conversation[] = await this.conversationRepository.find({
			where: {is_channel: true},
		});

		if (user && friend && conversations) {

			let friendChannels = [];
			friend.groups.forEach((group: GroupMember) => {
				conversations.forEach((conversation: Conversation) => {
					if (group.conversation.id == conversation.id && conversation.is_channel)
					friendChannels.push(conversation);
				});
			});
		
			let arrayDelete = [];
			user.groups.forEach((group: GroupMember) => {
				conversations.forEach((conversation: Conversation) => {
					if (group.isAdmin && group.conversation.id == conversation.id && conversation.is_channel)
						arrayDelete.push(conversation);
				});
			});
		
			const array1 = conversations.filter((conversation: Conversation) => arrayDelete.includes(conversation));
			const array2 = array1.filter((conversation: Conversation) => !friendChannels.includes(conversation));
			return array2;
		}

		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}

	async getAllPublicConversationsOption(userID : number) {

		const user = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		});

		let conversations : Conversation[] = await this.conversationRepository.find({
			where: {isPublic: true, is_channel: true},
		});

		if (user && conversations) {

			let arrayDelete = [];
			user.groups.forEach((group: GroupMember) => {
				conversations.forEach((conversation: Conversation) => {
					if (group.conversation.id == conversation.id && conversation.is_channel && conversation.isPublic)
						arrayDelete.push(conversation);
				});
			});

			const array = conversations.filter((conversation: Conversation) => !arrayDelete.includes(conversation));
			return array;
		}
		
		throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);
	}
}