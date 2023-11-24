import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { GroupMember } from './entities/group_member.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/users.entity'
import { MessageDto } from './dto/message.dto';
import { ConversationDto } from './dto/conversation.dto';

import { UsersService } from 'src/users/users.service';

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
		private usersService: UsersService,
	) {}

	private async getAllMessages(conversationName: string): Promise<Message[]> {

		console.log("Searching for: ", conversationName, " conversation");
		const conversation = await this.conversationRepository.find({ where: {name: conversationName} });
		if (!conversation) {
			console.error("Conversation  not found");
			return [];
		}

		const messages = await this.messageRepository.find({ where: {conversation: conversation}});
		return messages;
	}

	private async getAllConversations(userName: string): Promise<Conversation[]> {

		// login != username, penser a changer ca
		let userToFind = new User();
		userToFind = await this.usersRepository.findOne({
			where: { login: userName },
			relations: ["groups"],
		});
		if (userToFind) {
			console.log("==> Looking for ", userToFind.login, " conversations...");
			if (userToFind.groups && Array.isArray(userToFind.groups)) {
				console.log(userToFind.groups);
				const conversations = userToFind.groups.map((group: GroupMember) => group.conversation);
				console.log(conversations);
				return conversations;
			}
			return [];
		}
		console.error("Fatal error: user not found");
		return [];
	}

	private async createGroup(conversation: Conversation): Promise<GroupMember> {
		
		const group = new GroupMember();
		group.joined_datetime = new Date();
		group.conversation = conversation;
		return await this.groupMemberRepository.save(group);
	}

	async addUserToConversation(username: string, conversationName: string) {

		// login != username, penser a changer ca
		const conversation = await this.conversationRepository.findOne({ where: {name: conversationName} });
		if (conversation) {

			const userToAdd = await this.usersRepository.findOne({
				where: { login: username},
				relations: ['groups'],
			});

			if (userToAdd) {
				const newGroup = await this.createGroup(conversation);
				userToAdd.groups.push(newGroup);
			}
		}
	}

	async createConversation(conversationDto: ConversationDto): Promise<Conversation> {

		const user = await this.usersRepository.findOne({
			where: { login: conversationDto.username},
			relations: ['groups'],
		});
		if (user) {

			const conv = new Conversation();
			conv.name = conversationDto.name;
			await this.conversationRepository.save(conv);

			// const group = new GroupMember();
			// group.joined_datetime = new Date();
			// group.conversation = conv;
			// await this.groupMemberRepository.save(group);
			const group = await this.createGroup(conv);
			console.log("---> ", user.groups);

			if (Array.isArray(user.groups)) {
				user.groups.push(group);
				await this.usersRepository.save(user);
			}
			return conv;
		}
		return ;
	}

	async createMessage(messageDto: MessageDto) {
		console.log("-- createMessage --");
		let conversation = new Conversation();
		conversation = await this.conversationRepository.findOne({ where: {name: messageDto.conversationName } }); 
		if (conversation) {
			const newMessage = new Message();
			newMessage.from = messageDto.from;
			newMessage.content = messageDto.content;
			newMessage.post_datetime = messageDto.post_datetime;
			newMessage.conversation = conversation;

			return this.messageRepository.save(newMessage);
		}
		console.error("Fatal error: message could not be created");
		return;
	}

	getMessageById(idToFind: number) {
		return this.messageRepository.findOne({ where: {id: idToFind} });
	}

	async getMessages(conversationName: string): Promise<Message[]> {

		const allMessages = await this.getAllMessages(conversationName);
		if (!allMessages) {
			console.error("Fatal error: messsages not found");
			return [];
		}

		return allMessages;
	}

	async getConversations(userName: string): Promise<Conversation[]> {

		const allConversations = await this.getAllConversations(userName);
		if (!allConversations) {
			console.error("Fatal error: conversations not found");
			return [];
		}

		return allConversations;
	}

	async getLastTenMessages(conversationName: string): Promise<Message[]> {

		console.log("-- GET MESSAGES --");
		const allMessages = await this.getAllMessages(conversationName);
		if (!allMessages) {
			console.error("Fatal error: messsages not found");
			return [];
		}
		
		// Return the last 10 messages
		const last10Messages = allMessages.slice(-10);
		console.log("Messages: ", last10Messages);

		return last10Messages; // Reverse the array to get the correct order
	}
}
