import { Controller, Post, HttpCode, HttpStatus, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GroupDto } from './dto/group.dto';
import { MessageDto } from './dto/message.dto';
import { ConversationDto } from './dto/conversation.dto';
import { AddFriendToConversationDto } from './dto/addFriendToConversationDto.dto';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { GroupMember } from './entities/group_member.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('chat')
export class ChatController {
	constructor(private chatService: ChatService) {}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('newConversation')
	createNewConversation(@Body() conversationDto: ConversationDto): Promise<Conversation> {
		return this.chatService.createConversation(conversationDto);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('newMessage')
	createNewMessage(@Body() messageDto: MessageDto): Promise<Message> {
		return this.chatService.createMessage(messageDto);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('addFriendToConversation')
	addFriendToConversation(@Body() addUserToConversationDto: AddFriendToConversationDto): Promise<Conversation> {
		return this.chatService.addFriendToConversation(addUserToConversationDto);
	}

	// @Get('getMesssage/:id')
	// getMessage(@Param('id') id: number): Promise<Message | null> {
	// 	return this.chatService.getMessageById(id);
	// }

	@UseGuards(AuthGuard)
	@Get('getMessages/:conversationID')
	getMessagesFromConversation(@Param('conversationID') conversationID: number): Promise<Message[]> {
		return this.chatService.getMessages(conversationID);
	}

	@UseGuards(AuthGuard)
	@Get('getConversations/:userID')
	getConversationsFromUser(@Param('userID') userID: number): Promise<Conversation[]> {
		return this.chatService.getConversations(userID);
	}

	// verifier que le number est bon
	@UseGuards(AuthGuard)
	@Get('getConversationsWithStatus/:userID')
	getConversationsRightsFromUser(@Param('userID') userID: number) {
		return this.chatService.getConversationsWithStatus(userID);
	}
}