import { Controller, Post, HttpCode, HttpStatus, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GroupDto } from './dto/group.dto';
import { MessageDto } from './dto/message.dto';
import { ConversationDto } from './dto/conversation.dto';
import { AddUserToConversationDto } from './dto/addUserToConversationDto.dto';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { GroupMember } from './entities/group_member.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateConversationDto } from './dto/UpdateConversationDto.dto';
import { CheckPasswordDto } from './dto/checkPasswordDto.dto';

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
	@Post('addUserToConversation')
	addUserToConversation(@Body() addUserToConversationDto: AddUserToConversationDto): Promise<Conversation> {
		return this.chatService.addUserToConversation(addUserToConversationDto);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('updateConversation')
	updateConversationStatusAndPassword(@Body() updateConversationDto: UpdateConversationDto): Promise<Conversation> {
		return this.chatService.updateConversation(updateConversationDto);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('checkPassword')
	checkuserInputToPassword(@Body() checkPasswordDto: CheckPasswordDto): Promise<boolean> {
		return this.chatService.compareChannelPassword(checkPasswordDto);
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

	@UseGuards(AuthGuard)
	@Get('getConversationsPublic')
	getConversationsPublic(): Promise<Conversation[]> {
		return this.chatService.getAllPublicConversations();
	}

	@UseGuards(AuthGuard)
	@Get('getConversationsPublic/:userID')
	getConversationsPublicOption(@Param('userID') userID: number): Promise<Conversation[]> {
		console.log("userID", userID);
		return this.chatService.getAllPublicConversationsOption(userID);
	}

	// verifier que le number est bon
	@UseGuards(AuthGuard)
	@Get('getConversationsWithStatus/:userID')
	getConversationsRightsFromUser(@Param('userID') userID: number) {
		return this.chatService.getConversationsWithStatus(userID);
	}
}