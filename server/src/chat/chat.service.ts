import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { GroupMember } from './entities/group_member.entity';
import { Message } from './entities/message.entity';
import { User } from './../users/users.entity'

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Conversation)
		@InjectRepository(GroupMember)
		@InjectRepository(Message)
		private conversationRepository: Repository<Conversation>,
		private groupMemberRepository: Repository<GroupMember>,
		private messageRepository: Repository<Message>,
	) {}

	createConversation(conversationName): Promise<Conversation> {
		console.log("-- createConversation --");
		console.log("Conversation to be created: ", conversationName);
		const newConversation = this.conversationRepository.create({ conversationName });
		return this.conversationRepository.save(newConversation);
	}

	// Il faut envoyer la bonne Conversation pour que la FK soit correcte
	createMessage(from_login: string, content: string, post_datetime: Date, conversationKey: Conversation): Promise<Message> {
		const conversation = conversationKey;
		const newMessage = this.messageRepository.create({ from_login, content, post_datetime, conversation });
		return this.messageRepository.save(newMessage);
	}

	// We call this function with the createConversion: as soon as the conversation
	// is created, we create the group and give it the conversation entity + the users it needs
	createGroupMember(conversationKey: Conversation, userKey: User): Promise<GroupMember> {
		const joined_datetime = new Date().getHours();
		const left_datetime = new Date().getHours();
		const conversation = conversationKey;
		const newGroupMember = this.groupMemberRepository.create({ conversation, user: [userKey], joined_datetime, left_datetime });
		return this.groupMemberRepository.save(newGroupMember);
	}
}
