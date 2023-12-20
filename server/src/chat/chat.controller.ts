import { Controller, Post, HttpCode, HttpStatus, Body, Get, Param} from '@nestjs/common';
import { ChatService } from './chat.service';
import { GroupDto } from './dto/group.dto';
import { MessageDto } from './dto/message.dto';
import { ConversationDto } from './dto/conversation.dto';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { GroupMember } from './entities/group_member.entity';

@Controller('chat')
export class ChatController {
	constructor(private chatService: ChatService) {}
	
	@HttpCode(HttpStatus.OK)
	@Post('newConversation')
	createNewConversation(@Body() conversationDto: ConversationDto): Promise<Conversation> {
		return this.chatService.createConversation(conversationDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('newMessage')
	createNewMessage(@Body() messageDto: MessageDto): Promise<Message> {
		return this.chatService.createMessage(messageDto);
	}

	@Get('getMesssage/:id')
	getMessage(@Param('id') id: number): Promise<Message | null> {
		return this.chatService.getMessageById(id);
	}

	@Get('getMessages/:conversationID')
	getMessagesFromConversation(@Param('conversationID') conversationID: number): Promise<Message[]> {
		return this.chatService.getMessages(conversationID);
	}

	@Get('getConversations/:userID')
	getConversationsFromUser(@Param('userID') userID: number): Promise <GroupMember[]> {
		return this.chatService.getConversations(userID);
	}
}