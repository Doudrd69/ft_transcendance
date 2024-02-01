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
	createNewConversation(@Req() req,  @Body() conversationDto: ConversationDto): Promise<Conversation> {
		const { user } = req;
		return this.chatService.createConversation(conversationDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('newDMConversation')
	createNewDMConversation(@Req() req, @Body() DMcreationDto: DMcreationDto): Promise<Conversation> {
		const { user } = req;
		return this.chatService.createPrivateConversation(DMcreationDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('newMessage')
	createNewMessage(@Req() req, @Body() messageDto: MessageDto): Promise<Message> {
		const { user } = req;
		return this.chatService.createMessage(messageDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('addUserToConversation')
	addUserToConversation(@Req() req, @Body() addUserToConversationDto: AddUserToConversationDto): Promise<Conversation> {
		const { user } = req;
		return this.chatService.addUserToConversation(addUserToConversationDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('updateConversation')
	updateConversationStatusAndPassword(@Req() req, @Body() updateConversationDto: UpdateConversationDto): Promise<Conversation> {
		const { user } = req;
		return this.chatService.updateConversation(updateConversationDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('checkPassword')
	checkuserInputToPassword(@Req() req, @Body() checkPasswordDto: CheckPasswordDto): Promise<boolean> {
		const { user } = req;
		return this.chatService.compareChannelPassword(checkPasswordDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('quitConversation')
	userQuitsConversation(@Req() req, @Body() quitConversationDto: QuitConversationDto): Promise<boolean> {
		const { user } = req;
		return this.chatService.quitConversation(quitConversationDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('deleteConversation')
	deleteConversation(@Req() req, @Body() deleteConversationDto: DeleteConversationDto): Promise<boolean> {
		const { user } = req;
		return this.chatService.deleteConversation(deleteConversationDto, user.sub);
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
		return this.chatService.updateChannelPublicStatusToTrue(updateIsPublicDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('updateIsPublicFalse')
	updateChannelIsPublicStatusFalse(@Req() req, @Body() updateIsPublicDto: UpdateIsPublicDto){
		const { user } = req;
		return this.chatService.updateChannelPublicStatusToFalse(updateIsPublicDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('updateIsProtectedTrue')
	updateChannelIsprotectedStatusTrue(@Req() req, @Body() channelOptionsDto: ChannelOptionsDto): Promise<boolean> {
		const { user } = req;
		return this.chatService.updateChannelIsProtectedStatusToTrue(channelOptionsDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('updateIsProtectedFalse')
	updateChannelIsprotectedStatusFalse(@Req() req, @Body() updateProtectFalseDto: UpdateProtectFalseDto): Promise<boolean> {
		const { user } = req;
		return this.chatService.updateChannelIsProtectedStatusToFalse(updateProtectFalseDto, user.sub);
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
	@Get('getConversations')
	getConversationsFromUser(@Req() req): Promise<Conversation[]> {
		const { user } = req;
		return this.chatService.getAllChannelsFromUser(user.sub);
	}

	@UseGuards(AuthGuard)
	@Get('getDMsConversations')
	getDMsConversationsFromUser(@Req() req): Promise<Conversation[]> {
		const { user } = req;
		return this.chatService.getUserListFromDms(user.sub);
	}

	// @UseGuards(AuthGuard)
	// @Get('getConversationsPublic')
	// getConversationsPublic(): Promise<Conversation[]> {
	// 	return this.chatService.getAllPublicConversations();
	// }

	@UseGuards(AuthGuard)
	@Get('getConversationsPublic')
	getConversationsPublicOption(@Req() req)  {
		const { user } = req;
		return this.chatService.getAllPublicConversationsOption(user.sub);
	}

	// verifier que le number est bon
	@UseGuards(AuthGuard)
	@Get('getConversationsWithStatus')
	getConversationsRightsFromUser(@Req() req) {
		const { user } = req;
		return this.chatService.getConversationsWithStatus(user.sub);
	}

	// on garde le userID sur cette route car il correspond a l'ID du user a ajouter
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