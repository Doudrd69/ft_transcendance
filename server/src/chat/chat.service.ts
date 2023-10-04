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
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {}

	createConversation(conversationName, socketValue): Promise<Conversation> {
		console.log("-- createConversation --");
		console.log("Conversation to be created: ", conversationName);
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
		const joined_datetime = new Date();
		const left_datetime = new Date();
		const newGroupMember = this.groupMemberRepository.create({ conversation: conversationKey, user: [userKey], joined_datetime, left_datetime });
		return this.groupMemberRepository.save(newGroupMember);
	}

	getMessageById(id) {
		return this.messageRepository.findOne(id);
	}
}
