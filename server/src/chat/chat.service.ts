import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { GroupMember } from './entities/group_member.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/users.entity'
import { MessageDto } from './dto/message.dto';

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

		console.log("Conv to search: ", conversationName);
		const conversation = await this.conversationRepository.find({ where: {name: conversationName} });
		if (!conversation) {
			console.error("Conversatio  not found");
			return [];
		}

		const messages = await this.messageRepository.find({ where: {conversation: conversation}});
		return messages;
	}

	createConversation(conversationName, socketValue): Promise<Conversation> {
		console.log("-- createConversation --");
		console.log("Conversation to be created: ", conversationName);
		// verification
		const newConversation = this.conversationRepository.create({ name: conversationName });
		// Creer un groupe en parallele, avec le createur de la conversation
		this.usersRepository.find({ where: {socket: socketValue} }).then(result => {
			this.createGroupMember(newConversation, result[0]).then(result => {
				console.log("Group successfully created");
				return ;
			}).catch(error => {
				console.log("Error during group creation :", error);
			});
			console.log("== Groupe was created, we can save conversation ==");
			return this.conversationRepository.save(newConversation);
		}).catch(error => {
			console.log("Error during conversation creation :", error);
		});
		return ;
	}

	// Il faut envoyer la bonne Conversation pour que la FK soit correcte
	// Revoir la fonction en ajoutant la recherche par socket?
	async createMessage(messageDto: MessageDto) {
		console.log("-- createMessage --");
		await this.conversationRepository.find({ where: {name: messageDto.conversationName} }).then(result => {
			const newMessage = this.messageRepository.create({
				from_login: messageDto.from_login,
				content: messageDto.content,
				post_datetime: messageDto.post_datetime,
				conversation: result[0],
			});
			return this.messageRepository.save(newMessage);
		}).catch(error => {
			console.log("== Error in message creation ==");
		});
		return;
	}

	// We call this function with the createConversion: as soon as the conversation
	// is created, we create the group and give it the conversation entity + the users it needs
	createGroupMember(conversationKey: Conversation, userKey: User): Promise<GroupMember> {
		console.log("-- createGroupMember --");
		const joined_datetime = new Date();
		const left_datetime = new Date();
		const newGroupMember = this.groupMemberRepository.create({ conversation: conversationKey, user: [userKey], joined_datetime, left_datetime });
		return this.groupMemberRepository.save(newGroupMember);
	}

	getMessageById(id: number) {
		return this.messageRepository.findOne({ where: {id: id} });
	}

	async getLastTenMessages(conversationName: string): Promise<Message[]> {

		console.log("-- GET MESSAGES --");
		const allMessages = await this.getAllMessages(conversationName);
		if (!allMessages) {
			console.error("Fatal error: messsages not found");
			return [];
		}

		return allMessages;
	}
}
