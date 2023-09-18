import { Controller, Post, HttpCode, HttpStatus, Body, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@HttpCode(HttpStatus.OK)
	@Post('signup')
	createNewUser(@Body() signUpDto: Record<string, string>) {
		return this.usersService.createNewUser(signUpDto.username, signUpDto.password);
	}

	@HttpCode(HttpStatus.OK)
	@Post('delete')
	deleteUser(@Body() username: string) {
		return this.usersService.deleteUser(username);
	}

	@HttpCode(HttpStatus.OK)
	@Post('updateName')
	updateUser(@Body() updateUserDto: Record<string, string>) {
		return this.usersService.updateUser(updateUserDto.username, updateUserDto.newUsername);
	}
}
