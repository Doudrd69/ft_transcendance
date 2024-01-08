import { Controller, Post, HttpCode, HttpStatus, Body, Get, UploadedFile, UseInterceptors, Param, Res, UseGuards } from '@nestjs/common';
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
import { User } from './entities/users.entity';
import { UpdateUsernameDto } from './dto/UpdateUsernameDto.dto';
import { BlockUserDto } from './dto/BlockUserDto.dto';
import { validate, validateOrReject } from 'class-validator'
import { AuthGuard } from 'src/auth/auth.guard';
import { Conversation } from 'src/chat/entities/conversation.entity';

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
		if (!avatar) {
			return { error: "Aucun fichier d'avatar fourni." };
		}
		const avatarURL = `/avatars/${avatar.filename}`;
		await this.usersService.uploadAvatarURL(avatarURL, userId);
		return { avatarURL };
	} 

	@Get('getAvatar/:userId/:timestamp')
	async getUserAvatar(@Param('userId') userId: number, @Param('timestamp') timestamp: string, @Res() res: ExpressResponse) {
		try {
			const avatarURL = await this.usersService.getAvatar(userId);
			if (!avatarURL) {
				res.status(404).send('Avatar not foundi');
				return null;
			}
			res.setHeader('Content-Type', 'image/*'); 
			res.redirect(301, avatarURL);
			return avatarURL
		} catch (error) {
			console.error('Error retrieving avatar:', error);
			res.status(500).send('Internal Server Error');
		}
	}

	@Get('getAvatarByLogin/:login/:timestamp')
	async getUserAvatarbyUsername(@Param('login') login: string, @Param('timestamp') timestamp: string, @Res() res: ExpressResponse) {
		try {
			const avatarURL = await this.usersService.getAvatarbyLogin(login);
			if (!avatarURL) {
				res.status(404).send('Avatar not foundi');
				return null;
			}
			res.setHeader('Content-Type', 'image/*'); 
			res.redirect(301, avatarURL);
			return avatarURL
		} catch (error) {
			console.error('Error retrieving avatar:', error);
			res.status(500).send('Internal Server Error');
		}
	}
	@Get('getAvatarByLogin/:login')
	async getUserAvatarbyUsernamebis(@Param('login') login: string, @Res() res: ExpressResponse) {
		try {
			const avatarURL = await this.usersService.getAvatarbyLogin(login);
			if (!avatarURL) {
				res.status(404).send('Avatar not foundi');
				return null;
			}
			res.setHeader('Content-Type', 'image/*'); 
			res.redirect(301, avatarURL);
			return avatarURL
		} catch (error) {
			console.error('Error retrieving avatar:', error);
			res.status(500).send('Internal Server Error');
		}
	}

	@Get('getAvatar/:userId')
	async getUserAvatarAccess(@Param('userId') userId: number, @Param('timestamp') timestamp: string, @Res() res: ExpressResponse) {
		try {
			const avatarURL = await this.usersService.getAvatar(userId);
			if (!avatarURL) {
				console.log('getUserAvatar erreur');
				res.status(404).send('Avatar not foundi');
				return null;
			}
			res.setHeader('Content-Type', 'image/*'); 
			res.redirect(301, avatarURL);
			return avatarURL
		} catch (error) {
			console.error('Error retrieving avatar:', error);
			res.status(500).send('Internal Server Error');
		}
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('updateUsername')
	updateUsername(@Body() updateUsernameDto: UpdateUsernameDto): Promise<User> {
		return this.usersService.updateUsername(updateUsernameDto);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('addfriend')
	createFriendship(@Body() friendRequestDto: FriendRequestDto): Promise<Friendship | boolean> {
		return this.usersService.createFriendship(friendRequestDto);
	}

	// guard
	@HttpCode(HttpStatus.OK)
	@Post('friendRequestResponse')
	updateFriendship(@Body() friendRequestDto: FriendRequestDto, flag: boolean) {
		return this.usersService.updateFriendship(friendRequestDto, flag);
	}

	//guard
	@HttpCode(HttpStatus.OK)
	@Post('acceptFriendRequest')
	acceptFriendship(@Body() friendRequestDto: FriendRequestDto): Promise<Conversation | Friendship> {
		return this.usersService.acceptFriendship(friendRequestDto);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('blockUser')
	blockUser(@Body() blockUserDto: BlockUserDto): Promise<Conversation | Friendship> {
		return this.usersService.blockUser(blockUserDto);
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
