import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { GroupMember } from './entities/group_member.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/users.entity'
import { MessageDto } from './dto/message.dto';
import { ConversationDto } from './dto/conversation.dto';
import { UpdateConversationDto } from './dto/UpdateConversationDto.dto';
import { GroupDto } from './dto/group.dto';
import { group } from 'console';
import { AddFriendToConversationDto } from './dto/addFriendToConversationDto.dto';
import * as bcrypt from 'bcrypt'


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

	private async hashChannelPassword(password: string) {

		if (!password)
			return password;
	
		const saltOrRounds = 10;
		const hash = await bcrypt.hash(password, saltOrRounds);
		return hash;

		// will be used to compare user input to the channel's password
		// const isMatch = await bcrypt.compare(password, hash);
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

	private async getAllPublicConversations(): Promise<Conversation[]> {

		const publicConversations = await this.conversationRepository.find({
			where: {isPublic: true},
		});

		if (publicConversations) {
			console.log("Public convs => ", publicConversations);
			return publicConversations;
		}

		throw Error("No conversations found");
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
					conversationArray.push(group.conversation)
				})
				console.log('cojoweiwerwerew ==> ', conversationArray);
				return conversationArray;
			}
			return [];
		}
		console.error("Fatal error: user not found");
		return [];
	}

	async quitConversation(conversationDto: ConversationDto) {

		const conversationToRemove = await this.conversationRepository.findOne({ where: {name: conversationDto.name }});

		const user = await this.usersRepository.findOne({
			where: {id: conversationDto.userID},
			relations: ['groups'],
		});

		const groupToRemove = user.groups.filter((group: GroupMember) => group.conversation == conversationToRemove);
		const newArray = user.groups.filter((group: GroupMember) => group.conversation != conversationToRemove);
		console.log(newArray);
		await this.usersRepository.save(user);
		console.log("Array without ", conversationToRemove.name, " --> ", user.groups);

		await this.groupMemberRepository.remove(groupToRemove);
	}

	async eraseConversation(conversationDto: ConversationDto) {

		const conversationToRemove = await this.conversationRepository.findOne({ where: {name: conversationDto.name }});
		await this.conversationRepository.remove(conversationToRemove);
		return ;
	}

	async createGroup(conversation: Conversation, isAdminFlag: boolean): Promise<GroupMember> {
		
		console.log("Creating group...");
		const group = new GroupMember();
		group.isAdmin = isAdminFlag;
		group.joined_datetime = new Date();
		group.conversation = conversation;
		return await this.groupMemberRepository.save(group);
	}

	async addFriendToConversation(addUserToConversationDto: AddFriendToConversationDto): Promise<Conversation> {

		console.log("== ADD FRIEND TO CONVERSATION ==");

		const userToAdd = await this.usersRepository.findOne({
			where: { login: addUserToConversationDto.userToAdd },
			relations: ['groups'],
		});

		const conversationToAdd = await this.conversationRepository.findOne({
			where: {id: addUserToConversationDto.conversationID}
		});

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
		room.name = initiator.login + friend.login;;
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
		const user = await this.usersRepository.findOne({ where: { id: updateConversationDto.userID } });

		if (user && conversationToUpdate) {

			let isAdmin : boolean;

			// dans un custom Guard?
			user.groups.forEach((group: GroupMember) => {
				if (group.conversation.id == conversationToUpdate.id) {
					isAdmin = group.isAdmin;
				}
			});
			console.log(user.login, " admin status: ", isAdmin);

			if (isAdmin) {

				conversationToUpdate.isPublic = updateConversationDto.isPublic;
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
			conv.password = conversationDto.password;
			await this.conversationRepository.save(conv);

			// The user who created the conversation is set to admin
			const group = await this.createGroup(conv, true);

			user.groups.push(group);
			await this.usersRepository.save(user);

			return conv;
		}
		return ;
	}

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

	async getConversationsWithStatus(userID: number) {

		const user = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups"],
		});

		if (user) {

			let isAdminArray = [];
			user.groups.forEach((group: GroupMember) => {
				isAdminArray.push(group.isAdmin);
			});

			const conversationList = await this.getAllConversations(userID);
			console.log("Convs -> ", conversationList);

			const conversationArray = {
				conversationList: conversationList,
				isAdmin: isAdminArray,
			}

			return conversationArray;
		}

		console.error("Fatal error: conversations not found");
		return [];
	}
}
