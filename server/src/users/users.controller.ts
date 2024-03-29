import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response as ExpressResponse } from 'express';
import { randomBytes } from 'crypto';
import { diskStorage } from 'multer';
import Jimp from 'jimp';
import * as path from 'path';
import { extname } from 'path';
import * as fs from 'fs';

import { AuthGuard } from 'src/auth/auth.guard';

import { Conversation } from 'src/chat/entities/conversation.entity';
import { Friendship } from './entities/friendship.entity';

import { UsersService } from './users.service';

import { FriendRequestDto } from './dto/FriendRequestDto.dto';
import { UpdateUsernameDto } from './dto/UpdateUsernameDto.dto';
import { DeleteFriendRequestDto } from './dto/DeleteFriendRequestDto.dto';
import { BlockUserDto } from './dto/BlockUserDto.dto';

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


	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('upload-avatar')
	@UseInterceptors(FileInterceptor('avatar',
			{
				storage: diskStorage({ destination: null,
					filename: async (req, file, callback) => {
						const randomName = randomBytes(16).toString('hex');
						const fileExtension = extname(file.originalname);
						const newFilename = `${randomName}${fileExtension}`;
						callback(null, newFilename);
					},
				}),
			}))
	async uploadAvatar(@UploadedFile() avatar: Express.Multer.File, @Req() req) {
		try
		{
			const fileDescriptor = await fs.promises.open(avatar.path, 'r');
			const buffer = Buffer.alloc(8);
			await fileDescriptor.read(buffer, 0, 8, 0);
			await fileDescriptor.close();
			const signature = buffer.toString('hex');
			if(signature !== "89504e470d0a1a0a")
				throw new HttpException('Invalid file type', HttpStatus.BAD_REQUEST);
		
			const cheminImageSortie = path.join(__dirname, 'avatars', `carredanslaxe_${avatar.filename}`);
			const image = await Jimp.read(avatar.path);
			const taille = Math.min(image.bitmap.width, image.bitmap.height);
			const xOffset = (image.bitmap.width - taille) / 2;
			const yOffset = (image.bitmap.height - taille) / 2;
			
			await image
			.crop(xOffset, yOffset, taille, taille)
			.resize(400, 400)
			.writeAsync(cheminImageSortie);
			
			const { user } = req;
			const avatarURL = `/avatars/carredanslaxe_${avatar.filename}`;
			const status = await this.usersService.uploadAvatarURL(avatarURL, user.sub);
			if (!status)
				throw new HttpException('Upload failed', HttpStatus.BAD_REQUEST);
			return { avatarURL};
		}
		catch (error){
			throw error;
		}
	}

	// @UseGuards(AuthGuard)
	@Get('getAvatar/:userId/:timestamp')
	async getUserAvatar(@Param('userId') userId: number, @Param('timestamp') timestamp: string, @Res() res: ExpressResponse) {
		try {
			const avatarURL = await this.usersService.getAvatar(userId);
			if (!avatarURL) {
				throw new HttpException(`Avatar found`, HttpStatus.BAD_REQUEST);
			}
			res.setHeader('Content-Type', 'image/*'); 
			res.redirect(301, avatarURL);
			return avatarURL
		} catch (error) {
			throw error;
		}
	}

	// @UseGuards(AuthGuard)
	@Get('getAvatarByLogin/:login/:timestamp')
	async getUserAvatarbyUsername(@Param('login') login: string, @Param('timestamp') timestamp: string, @Res() res: ExpressResponse) {
		try {
			const avatarURL = await this.usersService.getAvatarbyLogin(login);
			if (!avatarURL) {
				throw new HttpException(`Avatar found`, HttpStatus.BAD_REQUEST);
			}
			res.setHeader('Content-Type', 'image/*'); 
			res.redirect(301, avatarURL);
			return avatarURL
		} catch (error) {
			throw error;
		}
	}

	// @UseGuards(AuthGuard)
	@Get('getAvatarByLogin/:login')
	async getUserAvatarbyUsernamebis(@Param('login') login: string, @Res() res: ExpressResponse) {
		try {
			const avatarURL = await this.usersService.getAvatarbyLogin(login);
			if (!avatarURL) {
				throw new HttpException(`Avatar found`, HttpStatus.BAD_REQUEST);
			}
			res.setHeader('Content-Type', 'image/*'); 
			res.redirect(301, avatarURL);
			return avatarURL
		} catch (error) {
			throw error;
		}
	}

	// @UseGuards(AuthGuard)
	@Get('getAvatar/:userId')
	async getUserAvatarAccess(@Param('userId') userId: number, @Param('timestamp') timestamp: string, @Res() res: ExpressResponse) {
		try {
			const avatarURL = await this.usersService.getAvatar(userId);
			if (!avatarURL) {
				throw new HttpException(`Avatar found`, HttpStatus.BAD_REQUEST);
			}
			res.setHeader('Content-Type', 'image/*'); 
			res.redirect(301, avatarURL);
			return avatarURL
		} catch (error) {
			throw error;
		}
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('updateUsername')
	updateUsername(@Req() req, @Body() updateUsernameDto: UpdateUsernameDto) {
		const { user } = req; 
		return this.usersService.updateUsername(updateUsernameDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('addfriend')
	createFriendship(@Req() req, @Body() friendRequestDto: FriendRequestDto): Promise<boolean> {
		// user is the initiator
		const { user } = req; 
		return this.usersService.createFriendship(friendRequestDto, user.sub);
	}

	// @UseGuards(AuthGuard)
	// @HttpCode(HttpStatus.OK)
	// @Post('friendRequestResponse')
	// updateFriendship(@Req() req, @Body() friendRequestDto: FriendRequestDto, flag: boolean) {
	// 	const { user } = req; 
	// 	return this.usersService.updateFriendship(friendRequestDto, flag, user.sub);
	// }

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('acceptFriendRequest')
	acceptFriendship(@Req() req, @Body() friendRequestDto: FriendRequestDto): Promise<Conversation | Friendship> {
		const { user } = req; 
		return this.usersService.acceptFriendship(friendRequestDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('deleteFriendRequest')
	handleDeleteFriendRequest(@Req() req, @Body() deleteFriendRequestDto: DeleteFriendRequestDto) {
		const { user } = req; 
		return this.usersService.deleteFriendRequest(deleteFriendRequestDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('blockUser')
	blockUser(@Req() req, @Body() blockUserDto: BlockUserDto): Promise<number> {
		// user is the initiator
		const { user } = req; 
		return this.usersService.blockUser(blockUserDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('unblockUser')
	unblockUser(@Req() req, @Body() blockUserDto: BlockUserDto): Promise<number> {
		const { user } = req;
		return this.usersService.unblockUser(blockUserDto, user.sub);
	}

	/********* GETTERS	********/

	@UseGuards(AuthGuard)
	@Get('getFriends')
	getFriendsList(@Req() req, ): Promise<Friendship[]> {
		const { user } = req;
		return this.usersService.getFriendships(user.sub);
	}
	
	@UseGuards(AuthGuard)
	@Get('getPendingFriends')
	getPendingFriendsList(@Req() req, ): Promise<Friendship[]> {
		const { user } = req;
		return this.usersService.getPendingFriendships(user.sub);
	}

	@UseGuards(AuthGuard)
	@Get('getUserList')
	getUserList(@Req() req, ) {
		const { user } = req;
		return this.usersService.getUserList(user.sub);
	}

	@UseGuards(AuthGuard)
	@Get('getGameHistory/:userID')
	getUserGamehistory(@Param('userID') userID: number) {
		return this.usersService.getUserGames(userID);
	}

	@UseGuards(AuthGuard)
	@Get('getUserStats/:userID')
	getUsersStats(@Param('userID') userID: number) {
		return this.usersService.getUsersStats(userID);
	}
}
