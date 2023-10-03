import { Controller, Post, HttpCode, HttpStatus, Body, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { FriendRequestDto } from './dto/FriendRequestDto.dto';

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
	// @Post('updateName')
	// updateUser(@Body() updateUserDto: Record<string, string>) {
	// 	return this.usersService.updateUser(updateUserDto.username, updateUserDto.newUsername);
	// }

	@HttpCode(HttpStatus.OK)
	@Post('addfriend')
	createFriendship(@Body() friendRequestDto: FriendRequestDto) {
		return this.usersService.createFriendship(friendRequestDto.initiatorLogin, friendRequestDto.recipientLogin);
	}

	@HttpCode(HttpStatus.OK)
	@Post('requestresponse')
	updateFriendship(@Body() friendRequestDto: FriendRequestDto, flag: boolean) {
		return this.usersService.updateFriendship(friendRequestDto.initiatorLogin, friendRequestDto.recipientLogin, flag);
	}
}
