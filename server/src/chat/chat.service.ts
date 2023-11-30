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
		@InjectRepository(GroupMember)
		private groupMemberRepository: Repository<GroupMember>,
		@InjectRepository(Message)
		private messageRepository: Repository<Message>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
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
		const userToFind = await this.usersRepository.findOne({ where: { login: userName } });
		if (userToFind) {
			console.log("Looking for ", userToFind.login, " conversations...");
			const conversations = userToFind.conversations;
			console.log(conversations);
			// const list = conversations.map((conversation: Conversation) => conversation.name);
			// console.log(list);
			return [];
		}
		console.error("Fatal error: user not found");
		return [];
	}

	async createConversation(conversationDto: ConversationDto): Promise<Conversation> {

		const user = await this.usersRepository.findOne({ where: { login: conversationDto.username } });
		if (user) {
			const newConversation = await this.conversationRepository.create({ name: conversationDto.name });
			await this.conversationRepository.save(newConversation);
			user.conversations = [newConversation];
			// user.conversations = [...user.conversations, newConversation];
			await this.usersRepository.save(user);
			return newConversation;
		}
		return ;
	}

	async createMessage(messageDto: MessageDto) {
		console.log("-- createMessage --");
		await this.conversationRepository.find({ where: {name: messageDto.conversationName} }).then(result => {
			const newMessage = this.messageRepository.create({
				from: messageDto.from,
				content: messageDto.content,
				post_datetime: messageDto.post_datetime,
				conversation: result[0],
			});
			return this.messageRepository.save(newMessage);
		}).catch(error => {
			console.log(error);
		});
		return;
	}

	// async createGroupMember(groupDto: GroupDto): Promise<GroupMember> {
		
	// 	console.log("-- Creating Group --");
	// 	const user = await this.usersRepository.findOne({ where: { login: groupDto.user } });
	// 	const conversation = await this.conversationRepository.findOne({ where: { name: groupDto.conversation} });

	// 	if (user && conversation) {
	// 		console.log("--> Linking conversation ", conversation.name, " with ID ", conversation.id ," to user ", user.login);
	// 		const joined_datetime = new Date();
	// 		const left_datetime = new Date();
	// 		const newGroup = await this.groupMemberRepository.create({ conversation: conversation, joined_datetime, left_datetime });
	// 		await this.groupMemberRepository.save(newGroup);
	// 		// user.members = 
    // 		// await this.usersRepository.save(user);
    
    // 		return newGroup;
	// 	}
	// 	return ;
	// }

	getMessageById(id: number) {
		return this.messageRepository.findOne({ where: {id: id} });
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
}
