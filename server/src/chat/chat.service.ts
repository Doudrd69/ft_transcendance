import { Injectable } from '@nestjs/common';
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
import { GroupDto } from './dto/group.dto';

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

		let groupFound;
		user.groups.forEach((userGroup: GroupMember) => {
			groupList.forEach((group: GroupMember) => {
				if (userGroup.id == group.id) {
					console.log("Found ", group.id);
					groupFound = group;
				}
			});
		});

		if (groupFound)
			return groupFound;

		return ;
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

	private async getGroupIsMuteStatus(user: User, conversation: Conversation): Promise<boolean> {

		let status = false;
		user.groups.forEach((group: GroupMember) => {
			if (group.conversation.id == conversation.id) {
				if (group.isMute) {
					status = true;
					return ;
				}
			}
		});

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

		let array = [];
		user.groups.forEach((userGroup: GroupMember) => {
			if (userGroup.conversation.is_channel) {
				let userListForThisGroup = [];
				users.forEach((user_: User) => {
						user_.groups.forEach((group: GroupMember) => {
							if (group.conversation.id == userGroup.conversation.id) {
								if (group.conversation.is_channel)
									userListForThisGroup.push({
										login: user_.login,
										avatarURL: user_.avatarURL,
										isOwner: group.isOwner,
										isAdmin: group.isAdmin,
										isBan: group.isBan,
										isMute: group.isMute,
									});
							}
						});
				});
				array.push(userListForThisGroup);
			}
		});

		return array;
	}

	private async getAllMessages(conversationID: number): Promise<Message[]> {

		const conversation = await this.conversationRepository.find({ where: {id: conversationID} });
		if (!conversation) {
			console.error("Conversation  not found");
			return [];
		}

		const messages = await this.messageRepository.find({ where: {conversation: conversation}});
		return messages;
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
		console.error("Fatal error: user not found");
		return [];
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
		console.error("Fatal error: user not found");
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
		console.error("Fatal error: user not found");
		return [];
	}



	/**************************************************************/
	/***					CHANNEL PASSWORD					***/
	/**************************************************************/

	async compareChannelPassword(checkPasswordDto: CheckPasswordDto): Promise<boolean> {

		const conversation : Conversation = await this.conversationRepository.findOne({ where: {id: checkPasswordDto.conversationID} });
		if (conversation) {
			const isMatch = await bcrypt.compare(checkPasswordDto.userInput, conversation.password);
			if (isMatch) {
				const addUserToConversationDto ={
					userToAdd: checkPasswordDto.username,
					conversationID: conversation.id,
				}
				console.log("Add user to protected conv");
				const conversationToAdd = await this.addUserToConversation(addUserToConversationDto);
				if (conversationToAdd)
					return true;
			}
		}

		return false;
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

	async updateChannelPublicStatusToTrue(channelOptionsDto: ChannelOptionsDto, _user: User): Promise<boolean> {

		console.log(_user);
		const user : User = await this.usersRepository.findOne({
			where: { id: channelOptionsDto.userID },
			relations: ["groups", "groups.conversation"],
		});

		const channelToUpdate : Conversation = await this.conversationRepository.findOne({
			where: { id: channelOptionsDto.conversationID },
		});

		const isUserIsAdmin = await this.getGroupIsAdminStatus(user, channelToUpdate);

		console.log(channelOptionsDto);
		if (isUserIsAdmin) {
			if (channelToUpdate) {
				channelToUpdate.isPublic = true;
				await this.conversationRepository.save(channelToUpdate);
				return true;
			}
		}

		return false;
	}

	async updateChannelPublicStatusToFalse(channelOptionsDto: ChannelOptionsDto, _user: User): Promise<boolean> {

		console.log(_user);
		const user : User = await this.usersRepository.findOne({
			where: { id: channelOptionsDto.userID },
			relations: ["groups", "groups.conversation"],
		});

		const channelToUpdate : Conversation = await this.conversationRepository.findOne({
			where: { id: channelOptionsDto.conversationID },
		});

		const isUserIsAdmin = await this.getGroupIsAdminStatus(user, channelToUpdate);

		console.log(channelOptionsDto);
		if (isUserIsAdmin) {
			if (channelToUpdate) {
				channelToUpdate.isPublic = false;
				await this.conversationRepository.save(channelToUpdate);
				return true;
			}
		}

		return false;
	}


	async updateChannelIsProtectedStatusToTrue(channelOptionsDto: ChannelOptionsDto): Promise<boolean> {

		const user : User = await this.usersRepository.findOne({
			where: { id: channelOptionsDto.userID},
			relations: ["groups", "groups.conversation"],
		});

		const channelToUpdate : Conversation = await this.conversationRepository.findOne({
			where: { id: channelOptionsDto.conversationID },
		});

		const isUserIsAdmin = await this.getGroupIsAdminStatus(user, channelToUpdate);

		if (isUserIsAdmin) {
			if (channelToUpdate) {
				channelToUpdate.isProtected = true;
				channelToUpdate.password = await this.hashChannelPassword(channelOptionsDto.password)
				await this.conversationRepository.save(channelToUpdate);
				}
				return true;
			}

		return false;
	}

	async updateChannelIsProtectedStatusToFalse(channelOptionsDto: ChannelOptionsDto): Promise<boolean> {

		const user : User = await this.usersRepository.findOne({
			where: { id: channelOptionsDto.userID},
			relations: ["groups", "groups.conversation"],
		});

		const channelToUpdate : Conversation = await this.conversationRepository.findOne({
			where: { id: channelOptionsDto.conversationID },
		});

		const isUserIsAdmin = await this.getGroupIsAdminStatus(user, channelToUpdate);

		if (isUserIsAdmin) {
			if (channelToUpdate) {
				channelToUpdate.isProtected = false;
				channelToUpdate.password = "";
				await this.conversationRepository.save(channelToUpdate);
				}
				return true;
			}

		return false;
	}



	/**************************************************************/
	/***					USER CHANNEL OPTIONS				***/
	/**************************************************************/

	async updateUserMuteStatusFromConversation(muteUserDto: UserOptionsDto): Promise<boolean> {

		const userToMute : User = await this.usersRepository.findOne({
			where: { username: muteUserDto.username },
			relations: ["groups"],
		});
		const user = await this.usersRepository.findOne({ where: { id: muteUserDto.from } });
		const conversation = await this.conversationRepository.findOne({ where: { id: muteUserDto.conversationID } });
		const userGroup = await this.getRelatedGroup(user, conversation);

		if (userToMute && conversation && userGroup) {
			const groupToUpdate = await this.getRelatedGroup(userToMute, conversation);

			if (userGroup.isOwner || userGroup.isAdmin) {
				if (groupToUpdate && !groupToUpdate.isOwner || !groupToUpdate.isAdmin) {
					groupToUpdate.isMute = true;
					await this.groupMemberRepository.save(groupToUpdate);
					return true;	
				}
			}
		}

		return false;
	}

	async updateUserUnmuteStatusFromConversation(muteUserDto: UserOptionsDto): Promise<boolean> {

		const userToMute : User = await this.usersRepository.findOne({
			where: { username: muteUserDto.username },
			relations: ["groups"],
		});
		const user = await this.usersRepository.findOne({ where: { id: muteUserDto.from } });
		const conversation = await this.conversationRepository.findOne({ where: { id: muteUserDto.conversationID } });
		const userGroup = await this.getRelatedGroup(user, conversation);

		if (userToMute && conversation && userGroup) {
			const groupToUpdate = await this.getRelatedGroup(userToMute, conversation);

			if (userGroup.isOwner || userGroup.isAdmin) {
				if (groupToUpdate && !groupToUpdate.isOwner || !groupToUpdate.isAdmin) {
					groupToUpdate.isMute = false;
					await this.groupMemberRepository.save(groupToUpdate);
					return true;	
				}
			}
		}

		return false;
	}

	async updateUserBanStatusFromConversation(banUserDto: UserOptionsDto): Promise<boolean> {

		const userToBan : User = await this.usersRepository.findOne({
			where: { username: banUserDto.username },
			relations: ["groups"],
		});
		const user = await this.usersRepository.findOne({ where: { id: banUserDto.from } });
		const conversation = await this.conversationRepository.findOne({ where: { id: banUserDto.conversationID } });
		const userGroup = await this.getRelatedGroup(user, conversation);

		if (userToBan && conversation && userGroup) {
			const groupToUpdate = await this.getRelatedGroup(userToBan, conversation);

			if (userGroup.isOwner || userGroup.isAdmin) {
				if (groupToUpdate && !groupToUpdate.isOwner || !groupToUpdate.isAdmin) {
					groupToUpdate.isBan = true;
					await this.groupMemberRepository.save(groupToUpdate);
					return true;
				}
			}

		}

		return false;
	}

	async updateUserUnbanStatusFromConversation(banUserDto: UserOptionsDto): Promise<boolean> {

		const userToBan : User = await this.usersRepository.findOne({
			where: { username: banUserDto.username },
			relations: ["groups"],
		});
		const user = await this.usersRepository.findOne({ where: { id: banUserDto.from } });
		const conversation = await this.conversationRepository.findOne({ where: { id: banUserDto.conversationID } });
		const userGroup = await this.getRelatedGroup(user, conversation);

		if (userToBan && conversation && userGroup) {
			const groupToUpdate = await this.getRelatedGroup(userToBan, conversation);

			if (userGroup.isOwner || userGroup.isAdmin) {
				if (groupToUpdate && !groupToUpdate.isOwner || !groupToUpdate.isAdmin) {
					groupToUpdate.isBan = false;
					await this.groupMemberRepository.save(groupToUpdate);
					return true;
				}
			}

		}

		return false;
	}

	async updateUserAdminStatusFromConversationTrue(promoteUserToAdminDto: UserOptionsDto): Promise<boolean> {

		const userToPromote : User = await this.usersRepository.findOne({
			where: { username: promoteUserToAdminDto.username },
			relations: ['groups'],
		});
		const user = await this.usersRepository.findOne({ where: { id: promoteUserToAdminDto.from } });
		const conversation = await this.conversationRepository.findOne({ where: { id: promoteUserToAdminDto.conversationID } });
		const userGroup = await this.getRelatedGroup(user, conversation);
	
		if (userToPromote && conversation && userGroup) {
			const groupToUpdate = await this.getRelatedGroup(userToPromote, conversation);

			if (userGroup.isOwner || userGroup.isAdmin) {
				if (groupToUpdate && !groupToUpdate.isOwner || !groupToUpdate.isAdmin) {
					groupToUpdate.isAdmin = true;
					await this.groupMemberRepository.save(groupToUpdate);
					return true;
				}
			}

		}

		return false;
	}

	async updateUserAdminStatusFromConversationFalse(promoteUserToAdminDto: UserOptionsDto): Promise<boolean> {

		const userToPromote : User = await this.usersRepository.findOne({
			where: { username: promoteUserToAdminDto.username },
			relations: ['groups'],
		});
		const user = await this.usersRepository.findOne({ where: { id: promoteUserToAdminDto.from } });
		const conversation = await this.conversationRepository.findOne({ where: { id: promoteUserToAdminDto.conversationID } });
		const userGroup = await this.getRelatedGroup(user, conversation);
	
		if (userToPromote && conversation && userGroup) {
			const groupToUpdate = await this.getRelatedGroup(userToPromote, conversation);

			if (userGroup.isOwner || userGroup.isAdmin) {
				if (groupToUpdate && !groupToUpdate.isOwner || !groupToUpdate.isAdmin) {
					groupToUpdate.isAdmin = false;
					await this.groupMemberRepository.save(groupToUpdate);
					return true;
				}
			}

		}

		return false;
	}



	/**************************************************************/
	/***					CONVERSATION						***/
	/**************************************************************/
	
	async promoteNewOwner(conversation: Conversation): Promise<boolean> {

		let groupToPromote : GroupMember;
		const relatedGroups: GroupMember[] = await this.groupMemberRepository.find({ where: { conversation: conversation} });
		// On a au moins un membre
		if (relatedGroups) {
			relatedGroups.forEach((group: GroupMember) => {
				if (!group.isBan) {
					groupToPromote = group;
					return ;
				}
			});
			if (groupToPromote) {
				groupToPromote.isOwner = true;
				await this.groupMemberRepository.save(groupToPromote);
	
				return true;
			}
		}
		// si aucun membre pour etre owner, ou pas de membres: on supprime le group et la conversation
		const allGroups = await this.groupMemberRepository.find();
		console.log("all groups before filter: ", allGroups);
		allGroups.filter((group: GroupMember) => group.id != relatedGroups[group.id].id);
		await this.groupMemberRepository.save(allGroups);
		console.log("all groups after filter: ", allGroups);

		await this.conversationRepository.delete(conversation);

		return false;
	}

	async quitConversation(quiConversationDto: QuitConversationDto): Promise<boolean> {

		const user : User = await this.usersRepository.findOne({
			where: { id: quiConversationDto.userID },
			relations: ["groups", "groups.conversation"],
		});

		const conversation : Conversation = await this.conversationRepository.findOne({
			where: { id: quiConversationDto.conversationID },
		});

		if (user && conversation) {

			const groupToRemove = await this.getRelatedGroup(user, conversation);
			const isOwnerStatus = await this.getGroupIsOwnerStatus(user, conversation);
			
			if (groupToRemove) {
				console.log("Before: ", user.groups);
				user.groups.filter((group: GroupMember) => group.id != groupToRemove.id);
				await this.usersRepository.save(user);
				console.log("After: ", user.groups);

				if (isOwnerStatus) {
					const status = await this.promoteNewOwner(conversation);
					console.log("Promote status: ", status);
				}

				return ;
			}
		}

		return ;
	}
	
	async addUserToConversation(addUserToConversationDto: AddUserToConversationDto): Promise<Conversation | { error: string }> {
		
		const userToAdd = await this.usersRepository.findOne({
			where: { username: addUserToConversationDto.userToAdd },
			relations: ['groups', 'groups.conversation'],
		});
		
		const conversationToAdd = await this.conversationRepository.findOne({
			where: {id: addUserToConversationDto.conversationID}
		});

		const isGroupInUsersArray = await this.getRelatedGroup(userToAdd, conversationToAdd);
		if (isGroupInUsersArray) {
			console.log("User has already joined", isGroupInUsersArray.conversation.name );
			return { error: "User has already joined this discussion" };
		}

		if (await this.getGroupIsBanStatus(userToAdd, conversationToAdd)) {
			console.log("Fatal error: user is ban from this channel");
			return { error: "User is banned from this discussion" };
		}
		
		if (conversationToAdd && userToAdd) {
			
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
		
		return { error: "Fatal error" };
	}
	
	async createFriendsConversation(initiator: User, friend: User): Promise<Conversation> {
		
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
		
		return ;
	}
	
	// Let admins update conversation to private/public and add/remove password
	async updateConversation(updateConversationDto: UpdateConversationDto): Promise<Conversation> {
		
		const conversationToUpdate = await this.conversationRepository.findOne({ where: { id: updateConversationDto.conversationID} });
		const user = await this.usersRepository.findOne({
			where: { id: updateConversationDto.userID },
			relations: ["groups", "groups.conversation"],
		});

		if (user && conversationToUpdate) {
			
			if (await this.getGroupIsAdminStatus(user, conversationToUpdate)) {

				conversationToUpdate.isPublic = updateConversationDto.isPublic;
				conversationToUpdate.isProtected = updateConversationDto.isProtected;
				if (updateConversationDto.newPassword)
					conversationToUpdate.password = await this.hashChannelPassword(updateConversationDto.newPassword);
				return await this.conversationRepository.save(conversationToUpdate);
			}
			
			return ;
		}
		
		return ;
	}
	
	async createConversation(conversationDto: ConversationDto): Promise<Conversation> {
		
		const user = await this.usersRepository.findOne({
			where: { id: conversationDto.userID},
			relations: ['groups'],
		});
		
		if (user) {
			
			const conv = new Conversation();
			conv.name = conversationDto.name;
			conv.is_channel = conversationDto.is_channel;
			conv.isPublic = conversationDto.isPublic;
			conv.isProtected = conversationDto.isProtected;
			if (conversationDto.password) {
				console.log("Password to save: ", conversationDto.password);
				conv.password = await this.hashChannelPassword(conversationDto.password);
			}
			await this.conversationRepository.save(conv);
			
			// The user who created the conversation is set to admin
			const group = await this.createGroup(conv, true, true);
			
			user.groups.push(group);
			await this.usersRepository.save(user);
			
			return conv;
		}
		return ;
	}



	/**************************************************************/
	/***						MESSAGE							***/
	/**************************************************************/
	
	// need to check muteStatus here or in front?
	async createMessage(messageDto: MessageDto): Promise<Message | boolean> {
		
		const conversation : Conversation = await this.conversationRepository.findOne({ where: {id: messageDto.conversationID} });
		const sender : User = await this.usersRepository.findOne({
			where: { username: messageDto.from },
			relations: ["groups", "groups.conversation"],
		});

		const isMuteStatus = await this.getGroupIsMuteStatus(sender, conversation);
		if (isMuteStatus) {
			console.error("User is mute");
			return false;
		}

		if (conversation) {
			const newMessage = new Message();
			newMessage.from = messageDto.from;
			newMessage.content = messageDto.content;
			newMessage.post_datetime = messageDto.post_datetime;
			newMessage.conversation = conversation;
			
			return await this.messageRepository.save(newMessage);
		}

		console.error("Fatal error: message could not be created");
		return ;
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

		throw Error("No conversations found");
	}
	
	async getAllPrivateConversations(): Promise<Conversation[]> {

		const publicConversations = await this.conversationRepository.find({
			where: {isPublic: false},
		});

		if (publicConversations) {
			return publicConversations;
		}

		throw Error("No conversations found");
	}
	

	getMessageById(idToFind: number) {
		return this.messageRepository.findOne({ where: {id: idToFind} });
	}

	async getConversationByID(id: number): Promise<Conversation> {

		const conversation = await this.conversationRepository.findOne({ where: {id: id} });
		if (conversation) {
			return conversation;
		}
		console.log("Fatal error: conversation not found");
		return ;
	}

	async getConversationByName(name: string): Promise<Conversation> {

		const conversation = await this.conversationRepository.findOne({ where: {name: name} });
		if (conversation) {
			return conversation;
		}
		console.log("Fatal error: conversation not found (getConversationByName)");
		return ;
	}

	async getConversationArrayByID(IDs: number[]): Promise<Conversation[]> {

		let conversations = <Conversation[]>[];

		for (let i = 0; i < IDs.length; i++) {
			const conversation = await this.getConversationByID(IDs[i]);
			conversations.push(conversation);
		}

		return conversations;
	}

	async getMessages(conversationID: number): Promise<Message[]> {

		const allMessages = await this.getAllMessages(conversationID);
		if (!allMessages) {
			console.error("Fatal error: messsages not found");
			return [];
		}

		return allMessages;
	}

	async getAllChannelsFromUser(userID: number): Promise<Conversation[]> {

		// get ALL CHANNELS
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

	// return un array d'array d'objets "user" : login, avatarURL
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

			// get ALL CHANNELS
			const conversationList = await this.getAllChannels(userID);
			const usersList = await this.getUserListFromConversations(user, conversationList);
			if (conversationList && usersList) {

				const conversationArray = {
					conversationList: conversationList,
					isAdmin: isAdminArray,
					usersList: usersList,
				}
	
				return conversationArray;
			}
		}

		console.error("Fatal error: conversations not found");
		return [];
	}

	async getAllPublicConversationsOption(userID : number) {

		const user = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		});

		let conversations : Conversation[] = await this.conversationRepository.find();
		// faire des test avec la liste quand le user a qu'un channel et qu'il est ban
		user.groups.forEach((group: GroupMember) => {
				conversations = conversations.filter((conversation: Conversation) => 
					conversation.id != group.conversation.id 
					&& conversation.isPublic == true 
					&& conversation.is_channel == true);
		});
		return conversations;
	}
}