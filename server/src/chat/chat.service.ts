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
import { group } from 'console';
import { AddFriendToConversationDto } from './dto/addFriendToConversationDto.dto';


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

	// private async getAllPublicConversations(): Promise<GroupMember[]> {

	// 	const publicCOnversations = await this.groupMemberRepository.find({
	// 		where: { isPublic: true},
	// 	});

	// 	if (publicCOnversations) {
	// 		return publicCOnversations;
	// 	}

	// 	throw Error("No conversations found");
	// }

	private async getAllConversations(userID: number): Promise<GroupMember[]> {

		let userToFind = new User();
		userToFind = await this.usersRepository.findOne({
			where: { id: userID },
			relations: ["groups"],
		});

		if (userToFind) {
			if (userToFind.groups && Array.isArray(userToFind.groups)) {
				const conversations = userToFind.groups;
				return conversations;
			}
			return [];
		}
		console.error("Fatal error: user not found");
		return [];
	}

	private async getConversationsRights(conversations: GroupMember[]) {

		if (conversations) {
			console.log("==== getConversationsRights ===");
			const groups = await this.groupMemberRepository.find({
				where: {conversation: conversations},
			});
			// console.log("User's groups: ", groups);
	
			let isAdminArray = [];
			groups.forEach((element: GroupMember) => {
				isAdminArray.push(element.isAdmin);
			});
			// console.log("IsAdminArray: ", isAdminArray);

			return isAdminArray;
		}
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

			const group = await this.groupMemberRepository.findOne({
				where: {conversation: conversationToAdd}
			});

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

		const roomName = initiator.login + friend.login;
		const room = new Conversation();
		room.name = roomName;
		room.is_channel = false;
		await this.conversationRepository.save(room);

		if (room) {
			// When we "join" 2 friends in their private cnversation, there are no admins
			const roomGroupInitiator = await this.createGroup(room, false);
			// const roomGroupFriend = await this.createGroup(room, false);
	
			if (roomGroupInitiator) {
	
				initiator.groups.push(roomGroupInitiator);
				friend.groups.push(roomGroupInitiator);
				await this.usersRepository.save([initiator, friend]);
			
				return room;
			}
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
			await this.conversationRepository.save(conv);

			// The user who created the conversation is set to admin
			const group = await this.createGroup(conv, true);

			if (Array.isArray(user.groups)) {
				user.groups.push(group);
				await this.usersRepository.save(user);
			}
			return conv;
		}
		return ;
	}

	async createMessage(messageDto: MessageDto): Promise<Message> {

		let conversation = new Conversation(); 
		conversation = await this.conversationRepository.findOne({ where: {id: messageDto.conversationID} }); 
		console.log("Linking message to ", conversation.name, " with ID ", conversation.id);
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

		console.log("Find : ", name);
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

	async getConversations(userID: number): Promise<GroupMember[]> {

		const allConversations = await this.getAllConversations(userID);
		if (!allConversations) {
			console.error("Fatal error: conversations not found");
			return [];
		}
		// console.log("Conversations --> ", allConversations);

		return allConversations;
	}

	async getConversationsWithStatus(userID: number) {

		const allConversations = await this.getAllConversations(userID);
		if (allConversations) {

			const conversationsRights = await this.getConversationsRights(allConversations);
			if (conversationsRights) {

				const conversationArray = {
					conversations: allConversations,
					isAdmin: conversationsRights,
				}

				// console.log("Conversations of user with ID", userID, " -> ", conversationArray);

				return conversationArray;
			}
		}
		
		console.error("Fatal error: conversations not found");
		return [];
	}
}
