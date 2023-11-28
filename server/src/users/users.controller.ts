import { Controller, Post, HttpCode, HttpStatus, Body, Get, UploadedFile, UseInterceptors, Param, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { FriendRequestDto } from './dto/FriendRequestDto.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	// @HttpCode(HttpStatus.OK)
	// @Post('signup')
	// createNewUser(@Body() signUpDto: Record<string, string>) {
	// 	return this.usersService.createNewUser(signUpDto.username, signUpDto.password);
	// }

	// @HttpCode(HttpStatus.OK)
	// @Post('delete')
	// deleteUser(@Body() username: string) {
	// 	return this.usersService.deleteUser(username);
	// }

	// @HttpCode(HttpStatus.OK)
	// @Post('upload-avatar')
	// @UseInterceptors(FileInterceptor('avatar')) // 'avatar' is the field name in the form
	// uploadAvatar(@UploadedFile() avatar: any) {
	// 	// `avatar` contains the uploaded file data
	// 	return this.usersService.uploadAvatar(avatar);
	// }

	// @Get(':id/avatar')
	// getAvatar(@Param('id') userId: number, @Res() res: Response) {
	// 	return this.usersService.getAvatarById(userId, res);
	// }

	@HttpCode(HttpStatus.OK)
	@Post('updateUsername')
	updateUsername(@Body() requestBody: {login: string, string: string}) {
		const { login } = requestBody;
		const { string } = requestBody;
		return this.usersService.updateUsername(login, string);
	}

	@HttpCode(HttpStatus.OK)
	@Post('addfriend')
	createFriendship(@Body() friendRequestDto: FriendRequestDto) {
		return this.usersService.createFriendship(friendRequestDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('requestresponse')
	updateFriendship(@Body() friendRequestDto: FriendRequestDto, flag: boolean) {
		return this.usersService.updateFriendship(friendRequestDto.initiatorLogin, friendRequestDto.recipientLogin, flag);
	}
}
