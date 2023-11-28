import { Controller, Post, HttpCode, HttpStatus, Body, Get, Param} from '@nestjs/common';
import { ChatService } from './chat.service';
import { GroupDto } from './dto/group.dto';
import { MessageDto } from './dto/message.dto';
import { ConversationDto } from './dto/conversation.dto';
import { User } from '../users/entities/users.entity'
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Controller('chat')
export class ChatController {
	constructor(private chatService: ChatService) {}
	
	@HttpCode(HttpStatus.OK)
	@Post('newConversation')
	createNewConversation(@Body() conversationDto: ConversationDto) {
		console.log("user is ", conversationDto.username);
		return this.chatService.createConversation(conversationDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('newGroup')
	createNewGroupMember(@Body() groupDto: GroupDto) {
		return this.chatService.createGroupMember(groupDto.conversation, groupDto.user);
	}

	@HttpCode(HttpStatus.OK)
	@Post('newMessage')
	createNewMessage(@Body() messageDto: MessageDto) {
		return this.chatService.createMessage(messageDto);
	}

	@Get(':id')
	getMessage(@Param('id') id: number): Promise<Message | null> {
		return this.chatService.getMessageById(id);
	}

	@Get('getMessages/:conversationName')
	getMessagesFromConversation(@Param('conversationName') conversationName: string): Promise<Message[]> {
		return this.chatService.getMessages(conversationName);
	}

	@Get('getConversations/:userName')
	getConversationsFromUser(@Param('userName') userName: string): Promise <Conversation[]> {
		return this.chatService.getConversations(userName);
	}
}