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
	createNewConversation(@Body() data: { formValue: string, socketValue: number }) {
		const { formValue, socketValue } = data;
		return this.chatService.createConversation(formValue, socketValue);
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
		console.log("convName endpoint");
		return this.chatService.getMessages(conversationName);
	}
}