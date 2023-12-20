import { Controller, Post, HttpCode, HttpStatus, Body, Get, UploadedFile, UseInterceptors, Param, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { FriendRequestDto } from './dto/FriendRequestDto.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Friendship } from './entities/friendship.entity';
import { User } from './entities/users.entity';
import { UpdateUsernameDto } from './dto/UpdateUsernameDto.dto';
import { validate, validateOrReject } from 'class-validator'

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@HttpCode(HttpStatus.OK)
	@Post('signup')
	createNewUser(@Body() requestBody: { username: string }) {
		const { username } = requestBody;
		return this.usersService.createNewUser(username);
	}

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
	updateUsername(@Body() updateUsernameDto: UpdateUsernameDto): Promise<User> {
		return this.usersService.updateUsername(updateUsernameDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('addfriend')
	createFriendship(@Body() friendRequestDto: FriendRequestDto): Promise<Friendship | null> {
		return this.usersService.createFriendship(friendRequestDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('friendRequestResponse')
	updateFriendship(@Body() friendRequestDto: FriendRequestDto, flag: boolean) {
		return this.usersService.updateFriendship(friendRequestDto, flag);
	}


	@HttpCode(HttpStatus.OK)
	@Post('acceptFriendRequest')
	acceptFriendship(@Body() friendRequestDto: FriendRequestDto): Promise<Friendship> {
		return this.usersService.acceptFriendship(friendRequestDto);
	}

	@Get('getFriends/:username')
	getFriendsList(@Param('username') username: string): Promise<Friendship[]> {
		return this.usersService.getFriendships(username);
	}

	@Get('getPendingFriends/:username')
	getPendingFriendsList(@Param('username') username: string): Promise<Friendship[]> {
		return this.usersService.getPendingFriendships(username);
	}
}
