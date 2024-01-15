import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ChatService } from './chat.service';
import { UpdateConversationDto } from './dto/UpdateConversationDto.dto';
import { AddUserToConversationDto } from './dto/addUserToConversationDto.dto';
import { CheckPasswordDto } from './dto/checkPasswordDto.dto';
import { ConversationDto } from './dto/conversation.dto';
import { MessageDto } from './dto/message.dto';
import { UserOptionsDto } from './dto/userOptionsDto.dto';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { GroupMember } from './entities/group_member.entity';
import { ChannelOptionsDto } from './dto/channelOptionsDto.dto';

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
	createNewMessage(@Body() messageDto: MessageDto): Promise<Message | boolean> {
		return this.chatService.createMessage(messageDto);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('addUserToConversation')
	addUserToConversation(@Body() addUserToConversationDto: AddUserToConversationDto): Promise<Conversation | { error: string }> {
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

	/****** USER OPTIONS ON CHANNEL ******/

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('banUser')
	banUserFromConversation(@Body() userOptionsDto: UserOptionsDto){
		return this.chatService.updateUserBanStatusFromConversation(userOptionsDto);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('muteUser')
	muteUserFromConversation(@Body() userOptionsDto: UserOptionsDto) {
		return this.chatService.updateUserMuteStatusFromConversation(userOptionsDto);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('adminUser')
	adminUserFromConversation(@Body() userOptionsDto: UserOptionsDto) {
		return this.chatService.updateUserAdminStatusFromConversation(userOptionsDto);
	}

	/****** CHANNEL OPTIONS ON CHANNEL ******/

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('updateIsPublic')
	updateChannelIsPublicStatus(@Body() channelOptionsDto: ChannelOptionsDto){
		return this.chatService.updateChannelIsPublicStatus(channelOptionsDto);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('updateIsProtected')
	updateChannelIsprotectedStatus(@Body() channelOptionsDto: ChannelOptionsDto) {
		return this.chatService.updateChannelIsProtectedStatus(channelOptionsDto);
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
	@Get('getFriendConversations/:userID')
	getFriendConversationsFromUser(@Param('userID') userID: number): Promise<Conversation[]> {
		return this.chatService.getFriendConversations(userID);
	}

	@UseGuards(AuthGuard)
	@Get('getConversationsPublic')
	getConversationsPublic(): Promise<Conversation[]> {
		return this.chatService.getAllPublicConversations();
	}

	@UseGuards(AuthGuard)
	@Get('getConversationsPublic/:userID')
	getConversationsPublicOption(@Param('userID') userID: number)  {
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