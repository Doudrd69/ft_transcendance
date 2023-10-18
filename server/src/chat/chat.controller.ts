import { Controller, Post, HttpCode, HttpStatus, Body, Get, Param} from '@nestjs/common';
import { ChatService } from './chat.service';
import { GroupDto } from './dto/group.dto';
import { MessageDto } from './dto/message.dto';
import { User } from '../users/entities/users.entity'
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Controller('chat')
export class ChatController {
	constructor(private chatService: ChatService) {}
	
	@HttpCode(HttpStatus.OK)
	@Post('newConversation')
	createNewConversation(@Body() requestBody: {conversationValue: string}) {
		const { conversationValue } = requestBody;
		return this.chatService.createConversation(conversationValue);
	}

	@HttpCode(HttpStatus.OK)
	@Post('newGroup')
	createNewGroupMember(@Body() groupDto: GroupDto) {
		return this.chatService.createGroupMember(groupDto.conversation, groupDto.user);
	}

	@HttpCode(HttpStatus.OK)
	@Post('newMessage')
	createNewMessage(@Body() messageDto: MessageDto) {
		console.log(messageDto);
		return this.chatService.createMessage(messageDto.from_user, messageDto.content, messageDto.post_datetime, messageDto.conversationName);
	}

	@Get('messages/:id')
	getMessage(@Param('id') id: number): Promise<Message | null> {
		return this.chatService.getMessageById(id);
	}
}