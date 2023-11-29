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

	// private async findConversationsForUser(userId: number): Promise<Conversation[]> {
	// 	return this.groupMemberRepository
	// 	.createQueryBuilder('groupMember')
	// 	.leftJoinAndSelect('groupMember.conversations', 'conversation')
	// 	.leftJoin('groupMember.users', 'user')
	// 	.where('user.id = :userId', { userId })
	// 	.getMany();
	//   }

	private async getAllConversations(userName: string): Promise<Conversation[]> {

		// login != username, penser a changer ca
		const userToFind = await this.usersRepository.findOne({ where: { login: userName } });
		if (userToFind) {
			console.log("Looking for ", userToFind.login, " conversations...");
			const groups = await this.usersRepository.find({
				where: { login: userName },
				relations: ["members"],
			});
			console.log("Groups --> ", groups);
			// const groups = await this.groupMemberRepository.find({
			// 	where: { },
			// 	relations: ["conversations"],
			// });
			// if (!groups) {
			// 	console.error("Fatal error: no groups found");
			// 	return [];
			// }
			// console.log("Groups --> ", groups);
			// const conversations = groups.map((group: GroupMember) => group.conversations);
			// // const allConversations = [].concat(...conversations);
			// console.log("Conv --> ", conversations);
			return [];
		}
		console.error("Fatal error: user not found");
		return [];
	}

	async createConversation(conversationDto: ConversationDto): Promise<Conversation> {

		await this.usersRepository.findOne({ where: { login: conversationDto.username } }).then(user => {
			const newConversation = this.conversationRepository.create({ name: conversationDto.name });
			if (newConversation)
				return this.conversationRepository.save(newConversation);
		}).catch(error => {
			console.log(error);
		});
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

	async createGroupMember(groupDto: GroupDto): Promise<GroupMember> {
		
		console.log("-- Creating Group --");
		const user = await this.usersRepository.findOne({ where: { login: groupDto.user } });
		const conversation = await this.conversationRepository.findOne({ where: { name: groupDto.conversation} });

		if (user && conversation) {
			console.log("--> Linking conversation ", conversation.name, " with ID ", conversation.id ," to user ", user.login);
			const joined_datetime = new Date();
			const left_datetime = new Date();
			const newGroup = this.groupMemberRepository.create({ conversation: conversation, joined_datetime, left_datetime });
			this.groupMemberRepository.save(newGroup);
			user.members = [newGroup];
			this.usersRepository.save(user);
			return newGroup;
		}
		return ;
	}

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
