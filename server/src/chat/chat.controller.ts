import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards, Req } from '@nestjs/common';
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
import { QuitConversationDto } from './dto/quitConversationDto.dto';
import { UpdateIsPublicDto } from './dto/updateIsPublicDto.dto';
import { UpdateProtectFalseDto } from './dto/updateProtectFalseDto.dto';
import { DeleteConversationDto } from './dto/deleteConversationDto.dto';
import { MuteUserDto } from './dto/muteUserDto.dto';
import { DMcreationDto } from './dto/DMcreationDto.dto';
import { kickUserDto } from './dto/kickuserDto.dto';

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
	@Post('newDMConversation')
	createNewDMConversation(@Body() DMcreationDto: DMcreationDto): Promise<Conversation> {
		return this.chatService.createPrivateConversation(DMcreationDto);
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

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('quitConversation')
	userQuitsConversation(@Body() quitConversationDto: QuitConversationDto): Promise<boolean> {
		return this.chatService.quitConversation(quitConversationDto);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('deleteConversation')
	deleteConversation(@Body() deleteConversationDto: DeleteConversationDto): Promise<boolean> {
		return this.chatService.deleteConversation(deleteConversationDto);
	}

	/******		USER OPTIONS ON CHANNEL		******/

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('kickUser')
	kickUserFromConversation(@Req() req, @Body() kickUserDto: kickUserDto): Promise<boolean>{
		const { user } = req;
		return this.chatService.kickUserFromConversation(kickUserDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('banUser')
	banUserFromConversation(@Req() req, @Body() userOptionsDto: UserOptionsDto): Promise<boolean> {
		const { user } = req;
		return this.chatService.updateUserBanStatusFromConversation(userOptionsDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('unbanUser')
	unbanUserFromConversation(@Req() req, @Body() userOptionsDto: UserOptionsDto): Promise<boolean>{
		const { user } = req;
		return this.chatService.updateUserUnbanStatusFromConversation(userOptionsDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('muteUser')
	muteUserFromConversation(@Req() req, @Body() muteUserDto: MuteUserDto): Promise<boolean> {
		const { user } = req;
		return this.chatService.updateUserMuteStatusFromConversation(muteUserDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('unmuteUser')
	unmuteUserFromConversation(@Req() req, @Body() userOptionsDto: UserOptionsDto): Promise<boolean> {
		const { user } = req;
		return this.chatService.updateUserUnmuteStatusFromConversation(userOptionsDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('promoteAdminUser')
	promoteadminUserFromConversation(@Req() req, @Body() userOptionsDto: UserOptionsDto): Promise<boolean> {
		const { user } = req;
		console.log("CONTROLLER", user);
		return this.chatService.updateUserAdminStatusFromConversationTrue(userOptionsDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('demoteAdminUser')
	demoteadminUserFromConversation(@Req() req, @Body() userOptionsDto: UserOptionsDto): Promise<boolean> {
		const { user } = req;
		return this.chatService.updateUserAdminStatusFromConversationFalse(userOptionsDto, user.sub);
	}

	/******		CHANNEL OPTIONS		******/

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('updateIsPublicTrue')
	updateChannelIsPublicStatusTrue(@Req() req, @Body() updateIsPublicDto: UpdateIsPublicDto){
		const { user } = req;
		return this.chatService.updateChannelPublicStatusToTrue(updateIsPublicDto, user);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('updateIsPublicFalse')
	updateChannelIsPublicStatusFalse(@Req() req, @Body() updateIsPublicDto: UpdateIsPublicDto){
		const { user } = req;
		return this.chatService.updateChannelPublicStatusToFalse(updateIsPublicDto, user);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('updateIsProtectedTrue')
	updateChannelIsprotectedStatusTrue(@Body() channelOptionsDto: ChannelOptionsDto): Promise<boolean> {
		return this.chatService.updateChannelIsProtectedStatusToTrue(channelOptionsDto);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('updateIsProtectedFalse')
	updateChannelIsprotectedStatusFalse(@Body() updateProtectFalseDto: UpdateProtectFalseDto): Promise<boolean> {
		return this.chatService.updateChannelIsProtectedStatusToFalse(updateProtectFalseDto);
	}


	/******		GETTERS		******/

	// @Get('getMesssage/:id')
	// getMessage(@Param('id') id: number): Promise<Message | null> {
	// 	return this.chatService.getMessageById(id);
	// }

	@UseGuards(AuthGuard)
	@Get('getMessages/:conversationID')
	getMessagesFromConversation(@Req() req, @Param('conversationID') conversationID: number): Promise<Message[]> {
		const { user } = req;
		return this.chatService.getMessages(conversationID, user.sub);
	}

	@UseGuards(AuthGuard)
	@Get('getConversations/:userID')
	getConversationsFromUser(@Param('userID') userID: number): Promise<Conversation[]> {
		return this.chatService.getAllChannelsFromUser(userID);
	}

	@UseGuards(AuthGuard)
	@Get('getDMsConversations/:userID')
	getDMsConversationsFromUser(@Param('userID') userID: number): Promise<Conversation[]> {
		return this.chatService.getUserListFromDms(userID);
	}

	// @UseGuards(AuthGuard)
	// @Get('getConversationsPublic')
	// getConversationsPublic(): Promise<Conversation[]> {
	// 	return this.chatService.getAllPublicConversations();
	// }

	@UseGuards(AuthGuard)
	@Get('getConversationsPublic/:userID')
	getConversationsPublicOption(@Param('userID') userID: number)  {
		return this.chatService.getAllPublicConversationsOption(userID);
	}

	// verifier que le number est bon
	@UseGuards(AuthGuard)
	@Get('getConversationsWithStatus/:userID')
	getConversationsRightsFromUser(@Param('userID') userID: number) {
		return this.chatService.getConversationsWithStatus(userID);
	}

	@UseGuards(AuthGuard)
	@Get('getConversationsToAdd/:userID')
	getConversationsToAdd(@Req() req, @Param('userID') userID: number) {
		const { user } = req;
		return this.chatService.getConversationsToAdd(userID, user.sub);
	}
	@UseGuards(AuthGuard)
	@Get('getUserList/:conversationID')
	getUserList(@Param('conversationID') conversation: number) {
		return this.chatService.getUserList(conversation);
	}
}