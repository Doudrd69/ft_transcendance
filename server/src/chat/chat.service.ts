import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { GroupMember } from './entities/group_member.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/users.entity'

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Conversation)
		private conversationRepository: Repository<Conversation>,
		@InjectRepository(GroupMember)
		private groupMemberRepository: Repository<GroupMember>,
		@InjectRepository(Message)
		private messageRepository: Repository<Message>,
	) {}

	createConversation(name): Promise<Conversation> {
		console.log("-- createConversation --");
		console.log("Conversation to be created: ", name);
		const newConversation = this.conversationRepository.create({ name });
		return this.conversationRepository.save(newConversation);
	}

	// Il faut envoyer la bonne Conversation pour que la FK soit correcte
	createMessage(from_login: string, content: string, post_datetime: Date, conversationName: string): Promise<Message> {
		console.log("-- createMessage --");
		// const conversation = conversationKey;
		this.conversationRepository.find({ where: {name: conversationName} }).then(result => {
			const newMessage = this.messageRepository.create({ from_login, content, post_datetime, conversation: result[0] });
			return this.messageRepository.save(newMessage);
		}).catch(error => {
			console.log("Error: ", error);
		});
		return;
	}

	// We call this function with the createConversion: as soon as the conversation
	// is created, we create the group and give it the conversation entity + the users it needs
	createGroupMember(conversationKey: Conversation, userKey: User): Promise<GroupMember> {
		console.log("-- createGroupMember --");
		const joined_datetime = new Date().getHours();
		const left_datetime = new Date().getHours();
		const newGroupMember = this.groupMemberRepository.create({ conversation: conversationKey, user: [userKey], joined_datetime, left_datetime });
		return this.groupMemberRepository.save(newGroupMember);
	}

	getMessageById(id) {
		return this.messageRepository.findOne(id);
	}
}
