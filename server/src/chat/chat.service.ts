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

	// le user foit avoir charge la relation groups.conversation pour toutes ces fonctions
	private async getRelatedGroup(user: User, conversation: Conversation): Promise<GroupMember> {

		const groupToSearch : GroupMember = await this.groupMemberRepository.findOne({
			where: { conversation: conversation },
		});

		let groupToReturn;
		user.groups.forEach((group: GroupMember) => {
			if (group.id == groupToSearch.id) {
				groupToReturn = group;
			}
		});

		if (groupToReturn)
			return groupToReturn

		return ;
	}

	private async getGroupIsAdminStatus(user: User, conversation: Conversation): Promise<boolean> {

		let status;
		user.groups.forEach((group: GroupMember) => {
			if (group.conversation.id == conversation.id) {
				if (group.isAdmin) {
					status = true;
					return ;
				}
				else
					status = false;
			}
		});

		return status;
	}

	private async getGroupIsBanStatus(user: User, conversation: Conversation): Promise<boolean> {

		user.groups.forEach((group: GroupMember) => {
			if (group.conversation.id == conversation.id) {
				if (group.isBan)
					return true;
				else
					return false;
			}
		});

		return false;
	}

	private async getGroupIsMuteStatus(user: User, conversation: Conversation): Promise<boolean> {

		user.groups.forEach((group: GroupMember) => {
			if (group.conversation.id == conversation.id) {
				if (group.isMute)
					return true;
				else
					return false;
			}
		});

		return false;
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

	
	private async getAllConversations(userID: number): Promise<Conversation[]> {
		
		
		const userToFind : User = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		});
		
		if (userToFind) {
			
			let conversationArray : Conversation[] = [];
			if (userToFind.groups && Array.isArray(userToFind.groups)) {
				userToFind.groups.forEach((group: GroupMember) => {
					if (group.conversation.is_channel)
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

	async createGroup(conversation: Conversation, isAdminFlag: boolean): Promise<GroupMember> {
		
		console.log("Creating group...");
		const group = new GroupMember();
		group.isAdmin = isAdminFlag;
		group.joined_datetime = new Date();
		group.conversation = conversation;
		return await this.groupMemberRepository.save(group);
	}

	/***						CHANNEL OPTIONS					***/

	async updateChannelIsPublicStatus(channelOptionsDto: ChannelOptionsDto) {

		const user : User = await this.usersRepository.findOne({
			where: { id: this.usersRepository.id },
			relations: ["groups", "groups.conversation"],
		});

		const channelToUpdate : Conversation = await this.conversationRepository.findOne({
			where: { id: channelOptionsDto.conversationID },
		});

		// check if user is admin/owner
		const isUserIsAdmin = await this.getGroupIsAdminStatus(user, channelToUpdate);

		if (isUserIsAdmin) {
			if (channelToUpdate) {
	
				if (channelOptionsDto.state)
					channelToUpdate.isPublic = false;
				else
					channelToUpdate.isPublic = true;
				await this.conversationRepository.save(channelToUpdate);
			}
		}

		return ;
	}

	async updateChannelIsProtectedStatus(channelOptionsDto: ChannelOptionsDto) {

		const user : User = await this.usersRepository.findOne({
			where: { id: this.usersRepository.id },
			relations: ["groups", "groups.conversation"],
		});

		const channelToUpdate : Conversation = await this.conversationRepository.findOne({
			where: { id: channelOptionsDto.conversationID },
		});

		// check if user is admin/owner
		const isUserIsAdmin = await this.getGroupIsAdminStatus(user, channelToUpdate);

		if (isUserIsAdmin) {
			if (channelToUpdate) {
	
				if (channelOptionsDto.state)
					channelToUpdate.isProtected = false;
				else {					
					channelToUpdate.isProtected = true;
					if (channelOptionsDto.password)
						channelToUpdate.password = await this.hashChannelPassword(channelOptionsDto.password)
				}

				await this.conversationRepository.save(channelToUpdate);
			}
		}

		return ;
	}

	/***					USER CHANNEL OPTIONS				***/
	async updateUserMuteStatusFromConversation(muteUserDto: UserOptionsDto) {

		const userToMute : User = await this.usersRepository.findOne({
			where: { username: muteUserDto.username },
			relations: ["groups"],
		});

		const conversation = await this.conversationRepository.findOne({ where: { id: muteUserDto.conversationID } });

		if (userToMute && conversation) {

			const groupToUpdate = await this.getRelatedGroup(userToMute, conversation);
			if (groupToUpdate) {

				if (muteUserDto.state)
					groupToUpdate.isMute = false;
				else
					groupToUpdate.isMute = true;
				await this.groupMemberRepository.save(groupToUpdate);
			}

			return ;
		}
	}

	async updateUserBanStatusFromConversation(banUserDto: UserOptionsDto) {

		const userToBan : User = await this.usersRepository.findOne({
			where: { username: banUserDto.username },
			relations: ["groups"],
		});

		const conversation = await this.conversationRepository.findOne({ where: { id: banUserDto.conversationID } });

		if (userToBan && conversation) {

			const groupToUpdate = await this.getRelatedGroup(userToBan, conversation);
			if (groupToUpdate) {

				if (banUserDto.state)
					groupToUpdate.isBan = false;
				else
					groupToUpdate.isBan = true;
				await this.groupMemberRepository.save(groupToUpdate);
			}

			return ;
		}
	}

	async updateUserAdminStatusFromConversation(promoteUserToAdminDto: UserOptionsDto) {

		const userToPromote : User = await this.usersRepository.findOne({
			where: { username: promoteUserToAdminDto.username },
			relations: ['groups'],
		});

		const conversation = await this.conversationRepository.findOne({ where: { id: promoteUserToAdminDto.conversationID } });
	
		if (userToPromote && conversation) {

			const groupToUpdate = await this.getRelatedGroup(userToPromote, conversation);
			if (groupToUpdate) {

				if (promoteUserToAdminDto.state)
					groupToUpdate.isBan = false;
				else
					groupToUpdate.isBan = true;
				await this.groupMemberRepository.save(groupToUpdate);
			}

			return ;
		}
	}

	/**************************************************************/
	/***					CONVERSATION						***/
	/**************************************************************/

	async quitConversation(conversationDto: ConversationDto) {
		
		// faire par ID
		const conversationToRemove = await this.conversationRepository.findOne({ where: {name: conversationDto.name }});
		
		const user = await this.usersRepository.findOne({
			where: {id: conversationDto.userID},
			relations: ['groups'],
		});

		if (conversationToRemove && user) {

			// methode 1
			// const groupsUpdated = user.groups.filter((group: GroupMember) => group.conversation != conversationToRemove);
			// user.groups = groupsUpdated;
			// await this.usersRepository.save(user);

			// methode 2
			// const groupToRemove = user.groups.filter((group: GroupMember) => group.conversation != conversationToRemove);
			// user.groups.splice(groupToRemove);
			// await this.usersRepository.save(user)

			return ;
		}
		
		console.log("Fatal error");
		return ;
	}
	
	async eraseConversation(conversationDto: ConversationDto) {
		
		const conversationToRemove = await this.conversationRepository.findOne({ where: {name: conversationDto.name }});
		await this.conversationRepository.remove(conversationToRemove);
		return ;
	}
	
	async addUserToConversation(addUserToConversationDto: AddUserToConversationDto): Promise<Conversation> {
		
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
			return ;
		}

		if (await this.getGroupIsBanStatus(userToAdd, conversationToAdd)) {
			console.log("Fatal error: user is ban from this channel");
			return ;
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
			
			return ;
		}
		
		return ;
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
			const group = await this.createGroup(conv, true);
			
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
	async createMessage(messageDto: MessageDto): Promise<Message> {
		
		const conversation : Conversation = await this.conversationRepository.findOne({ where: {id: messageDto.conversationID} });

		if (conversation) {
			const newMessage = new Message();
			newMessage.from = messageDto.from;
			newMessage.content = messageDto.content;
			newMessage.post_datetime = messageDto.post_datetime;
			newMessage.conversation = conversation;
			
			return await this.messageRepository.save(newMessage);
		}

		console.error("Fatal error: message could not be created");
		return;
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

	async getConversations(userID: number): Promise<Conversation[]> {

		const allConversations = await this.getAllConversations(userID);
		if (!allConversations) {
			console.error("Fatal error: conversations not found");
			return [];
		}

		return allConversations;
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

			const conversationList = await this.getAllConversations(userID);
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

	async getAllPublicConversationsOption(userID : number)
	{
		const user = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups", "groups.conversation"],
		});

		const groups  = await this.groupMemberRepository.find({
			relations: ["conversation"],
		});

		let array = [];

		const groupIsChannel = groups.filter((group: GroupMember) => group.conversation.is_channel == true);
		const groupIsPublic = groupIsChannel.filter((group: GroupMember) => group.conversation.isPublic == true);

		// console.log(groupIsPublic);

		groupIsPublic.forEach((group: GroupMember) => {
			if (!user.groups[group.id]) {
				array.push({
					id: group.conversation.id,
					name: group.conversation.name,
					is_channel: group.conversation.is_channel,
					isProtected: group.conversation.isProtected,
				});
			}
		});

		console.log("notme: ", array);
		if (array)
			return array;
		else
			throw Error("No conversations found");
	}
}
