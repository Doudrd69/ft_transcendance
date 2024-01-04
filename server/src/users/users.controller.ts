import { Controller, Post, HttpCode, HttpStatus, Body, Get, UploadedFile, UseInterceptors, Param, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { FriendRequestDto } from './dto/FriendRequestDto.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Friendship } from './entities/friendship.entity';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { Response as ExpressResponse } from 'express';
import {Readable} from 'stream'
import { StreamableFile } from '@nestjs/common';
import imageType from 'image-type';
import * as fs from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';
import * as path from 'path';
import { extname } from 'path';
import Jimp from 'jimp';





@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}
	
	
	// @HttpCode(HttpStatus.OK)
	// @Post('signup')
	// createNewUser(@Body() signUpDto: Record<string, string>) {
	// 	return this.usersService.createNewUser(signUpDto.username, signUpDto.password);
	// }

	// @HttpCode(HttpStatus.OK)
	// @Post('delete
	// deleteUser(@Body() username: string) {
	// 	return this.usersService.deleteUser(username);
	// }


	@HttpCode(HttpStatus.OK)
	@Post('upload-avatar/:userId')
	@UseInterceptors(FileInterceptor('avatar', {
		storage: diskStorage({
		destination: path.join(__dirname, 'avatars'),
		filename: async (req, file, callback) => {
			const randomName = randomBytes(16).toString('hex');
			const fileExtension = extname(file.originalname);
			const newFilename = `${randomName}${fileExtension}`;
			callback(null, newFilename);
		},
		}),
	}))
	async uploadAvatar(@UploadedFile() avatar: Express.Multer.File, @Param('userId') userId: number) {
		const avatarURL = `/avatars/${avatar.filename}`;
		await this.usersService.uploadAvatarURL(avatarURL, userId);
		return { avatarURL };
	} 

	@Get('getAvatar/:userId')
	async getUserAvatar(@Param('userId') userId: number, @Res() res: ExpressResponse) {

		try {
			const avatarURL = await this.usersService.getAvatar(userId);
			console.log('avatarURL=====>', avatarURL);

		if (!avatarURL) {
			console.log('getUserAvatar erreur');
			res.status(404).send('Avatar not found');
			return;
		}
			res.setHeader('Content-Type', 'image/*'); 
			res.redirect(301, avatarURL);
			console.log('avatarURL=====>', avatarURL)
		} catch (error) {
			console.error('Error retrieving avatar:', error);
			res.status(500).send('Internal Server Error');
		}
	}

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
	@Post('friendRequestResponse')
	updateFriendship(@Body() friendRequestDto: FriendRequestDto, flag: boolean) {
		return this.usersService.updateFriendship(friendRequestDto, flag);
	}


	@HttpCode(HttpStatus.OK)
	@Post('acceptFriendRequest')
	acceptFriendship(@Body() friendRequestDto: FriendRequestDto) {
		return this.usersService.acceptFriendship(friendRequestDto);
	}

	@Get('getFriends/:username')
	getFriendsList(@Param('username') username: string): Promise<Friendship[]> {
		return this.usersService.getFriendships(username);
	}
}