import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { GroupMember } from './entities/group_member.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/users.entity'
import { MessageDto } from './dto/message.dto';
import { ConversationDto } from './dto/conversation.dto';
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

	private async getAllMessages(conversationID: number): Promise<Message[]> {

		const conversation = await this.conversationRepository.find({ where: {id: conversationID} });
		if (!conversation) {
			console.error("Conversation  not found");
			return [];
		}

		const messages = await this.messageRepository.find({ where: {conversation: conversation}});
		return messages;
	}

	private async getAllConversations(userName: string): Promise<GroupMember[]> {

		// login != username, penser a changer ca
		let userToFind = new User();
		userToFind = await this.usersRepository.findOne({
			where: { login: userName },
			relations: ["groups"],
		});

		if (userToFind) {
			console.log("==> Looking for ", userToFind.login, " conversations...");
			if (userToFind.groups && Array.isArray(userToFind.groups)) {
				const conversations = userToFind.groups;
				console.log("conversations --> ", conversations);
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
		// pb ici car il va me return la premiere avec le meme nom sans avoir si le user est dedans
		let user = new User();
		user = await this.usersRepository.findOne({
			where: {login: username},
			relations: ['groups'],
		});

		const groups = user.groups;
		const conversation = groups.map((group: GroupMember) => group.conversation).filter((conversation: Conversation) => conversation.name == conversationName);
		console.log(conversation);

		return ;
	}

	async createConversation(conversationDto: ConversationDto): Promise<Conversation> {

		const user = await this.usersRepository.findOne({
			where: { login: conversationDto.username},
			relations: ['groups'],
		});

		if (user) {

			const conv = new Conversation();
			conv.name = conversationDto.name;
			conv.is_channel = conversationDto.is_channel;
			await this.conversationRepository.save(conv);

			const group = await this.createGroup(conv);

			if (Array.isArray(user.groups)) {
				user.groups.push(group);
				await this.usersRepository.save(user);
			}
			return conv;
		}
		return ;
	}

	async createMessage(messageDto: MessageDto) {

		let conversation = new Conversation();
		console.log("CONV ID to find : ", messageDto.conversationID);
		conversation = await this.conversationRepository.findOne({ where: {id: messageDto.conversationID} }); 
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

	async getMessages(conversationID: any): Promise<Message[]> {

		console.log("ID retreived --> ", conversationID);
		const allMessages = await this.getAllMessages(conversationID);
		if (!allMessages) {
			console.error("Fatal error: messsages not found");
			return [];
		}

		return allMessages;
	}

	async getConversations(userName: string): Promise<GroupMember[]> {

		const allConversations = await this.getAllConversations(userName);
		if (!allConversations) {
			console.error("Fatal error: conversations not found");
			return [];
		}

		return allConversations;
	}
}
