import { Controller, Post, HttpCode, HttpStatus, Body, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GroupDto } from './dto/group.dto';
import { MessageDto } from './dto/message.dto';
import { User } from './../users/users.entity'
import { Conversation } from './entities/conversation.entity';

@Controller('chat')
export class ChatController {
	constructor(private chatService: ChatService) {}

	@HttpCode(HttpStatus.OK)
	@Post('newConversation')
	createNewConversation(@Body() conversationName: string) {
		return this.chatService.createConversation(conversationName);
	}

	@HttpCode(HttpStatus.OK)
	@Post('newGroup')
	createNewGroupMember(@Body() groupDto: GroupDto) {
		return this.chatService.createGroupMember(groupDto.conversation, groupDto.user);
	}

	@HttpCode(HttpStatus.OK)
	@Post('newMessage')
	createNewMessage(@Body() messageDto: MessageDto) {
		return this.chatService.createMessage(messageDto.from_user, messageDto.content, messageDto.post_datetime, messageDto.conversation);
	}
}