import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { GroupMember } from 'src/chat/entities/group_member.entity';
import { ChatService } from 'src/chat/chat.service';
import { UsersService } from 'src/users/users.service';
import { Conversation } from 'src/chat/entities/conversation.entity';
import { MessageDto } from 'src/chat/dto/message.dto';
import { GatewayGuard } from './Gatewayguard.guard';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common'
import { Req } from '@nestjs/common'
import dotenv from 'dotenv';

dotenv.config();

@WebSocketGateway({
	namespace: 'user',
	cors: {
		origin: ['http://localhost:3000', `${process.env.SERVER_REDIRECT_URI}`]
	},
	middlewares: [GatewayGuard],
})

export class GeneralGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private chatService: ChatService,
		private userService: UsersService,
	) { }

	@WebSocketServer()
	server: Server;

	private connectedUsers: { [userId: string]: Socket } = {};

	private async userRejoinsRooms(client: Socket, userID: number) {

		try {
			const conversations = await this.chatService.getAllConversations(userID);
			if (conversations) {
				let ids = <number[]>[];
				conversations.forEach(function (value) {
					ids.push(value.id);
				});

				const conv = await this.chatService.getConversationArrayByID(ids);
				conv.forEach(function (value) {
					client.join(value.name + value.id);
				})

				const blockedUsers = await this.userService.getBlockedUserList(userID);
				if (blockedUsers) {
					blockedUsers.forEach((blockedUser: string) => {
						client.join(`whoblocked${blockedUser}`)
					})
				}
			}
		} catch (error) {
			throw error;
		}
	}

	private async userLeavesRooms(client: Socket, userID: number) {

		try {
			const conversations = await this.chatService.getAllConversations(userID);
			if (conversations) {
				let ids = <number[]>[];
				conversations.forEach(function (value) {
					ids.push(value.id);
				});

				const conv = await this.chatService.getConversationArrayByID(ids);
				conv.forEach(function (value) {
					client.leave(value.name);
				})

				const blockedUsers = await this.userService.getBlockedUserList(userID);
				if (blockedUsers) {
					blockedUsers.forEach((blockedUser: string) => {
						client.leave(`whoblocked${blockedUser}`)
					})
				}
			}
		} catch (error) {
			throw error;
		}
	}

	private async notifyFriendList(userID: number, personnalRoom: string, status: string) {
		
		let user;
		if (status === 'online')
			user = await this.userService.updateUserStatus(userID, true);
		else if (status === 'offline')
			user = await this.userService.updateUserStatus(userID, false);
		else
			throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);

		if (user) {

			const friends = await this.userService.getFriendships(userID);
			if (friends) {

				friends.forEach((friend: any) => {
					console.log("-- Notifying connection/deconnction of ", friend.username," --");
					this.server.except(personnalRoom).to(friend.username).emit('refreshUserOnlineState', `${personnalRoom} is ${status}`);
				});

				// Emit to refresh DM list for user who are not friends
				this.server.except(personnalRoom).emit('refreshUserOnlineState');

				return;
			}
		}

		throw new HttpException('User not found', HttpStatus.NOT_FOUND);
	}

	async handleConnection(client: Socket) {

		try {

			console.log(`== GeneralGtw ---> USERSOCKET client connected: ${client.id}`);
			this.connectedUsers[client.id] = client;

			client.on('joinPersonnalRoom', (personnalRoom: string, userID: number) => {

				client.join(personnalRoom);
				console.log("== Client ", client.id, " has joined ", personnalRoom, " room");
				this.userRejoinsRooms(client, userID);
				this.notifyFriendList(userID, personnalRoom, 'online');
				this.server.emit('newUser');

				client.on('disconnect', () => {
					console.log("===> Disconnecting user ", personnalRoom, " with ID ", userID);
					this.notifyFriendList(userID, personnalRoom, 'offline');
					client.leave(personnalRoom);
					console.log("Client ", client.id, " has left ", personnalRoom, " room");
					this.userLeavesRooms(client, userID);
				})

			});
		} catch (error) {
			console.log(' == Gatewway: ', error);
		}
	}

	handleDisconnect(client: Socket) {
		console.log(`== GeneralGtw ---> USERSOCKET client disconnected: ${client.id}`);
		delete this.connectedUsers[client.id];
	}

	@SubscribeMessage('joinRoom')
	@UseGuards(GatewayGuard)
	async addUserToRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomName: string, roomID: string }) {

		// verifier que le user peut join? (est dans la conversation)
		try {
			const { roomName, roomID } = data;
			const user = client.handshake.auth.user;
			console.log("==== joinRoom Event ====");
			console.log("Add ", "[", client.id,"]", " to room : ", roomName + roomID);
	
			if (roomID && await this.chatService.isUserInConversation(user.sub, Number(roomID)))
				client.join(roomName + roomID);
			else
				client.join(roomName);
	
			this.server.to(roomName + roomID).emit('refresh_channel');
	
			return;
		} catch (error) {
			throw error;
		}
	}

	@SubscribeMessage('leaveRoom')
	@UseGuards(GatewayGuard)
	async leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomName: string, roomID: string }) {

		const { roomName, roomID } = data;
		console.log("==== leaveRoom Event ====");
		console.log("Remove ", "[", client.id,"]", " to room : ", roomName + roomID);

		if (roomID)
			client.leave(roomName + roomID);
		else
			client.leave(roomName);

		this.server.to(roomName + roomID).emit('refresh_channel');
		
		return;
	}

	@SubscribeMessage('addUserToRoom')
	@UseGuards(GatewayGuard)
	addUserToNewRoom(@MessageBody() data: { convID: number, convName: string, friend: string }) {
		const { convID, convName, friend } = data;
		console.log("==== addUserToRoom Event ====");
		console.log("Emit to add ", friend, " to room : ", convName + convID);
		this.server.to(friend).emit('userAddedToRoom', {
			convID: convID,
			convName: convName,
		});
	}

	@SubscribeMessage('checkSenderInMatch')
	@UseGuards(GatewayGuard)
	async checkIfSendInMatch(@MessageBody() data: { senderUsername: string, senderUserId: number }) {
		try {
			if (await this.userService.userToInviteGameIsAlreadyInGame(data.senderUserId)) {
				console.log(`sender already inGame`);
				this.server.to(data.senderUsername).emit('senderInGame');
				return;
			}
			this.server.to(data.senderUsername).emit('senderNotInGame');
		} catch (error) {
			console.log(`[GAME INVITE ERROR]: ${error.stack}`)
		}
	}

	@SubscribeMessage('inviteToGame')
	@UseGuards(GatewayGuard)
	async inviteUserToGame(@ConnectedSocket() client: Socket, @MessageBody() data: { usernameToInvite: string, userIdToInvite: number, senderID: string, senderUsername: string }) {
		console.log(`inviteUserToGame:  ${data.userIdToInvite}`);
		try {
			const { usernameToInvite, userIdToInvite, senderID, senderUsername } = data;
			const user = client.handshake.auth.user;
			if (await this.userService.userToInviteGameIsAlreadyInGame(userIdToInvite)) {
				this.server.to(client.id).emit('userToInviteAlreadyInGame');
				return;
			}

			this.server.to(usernameToInvite).emit('gameInvite', {
				senderUserID: user.sub,
				senderID: senderID,
				senderUsername: senderUsername,
			});
		} 
		catch (error) {
			console.log(`[GAME INVITE ERROR]: ${error.stack}`)
		}
	}

	@SubscribeMessage('inviteClosed')
	@UseGuards(GatewayGuard)
	handleInviteClosed(@ConnectedSocket() client: Socket, @MessageBody() data: { senderUsername: string }) {
		console.log("CLOSED")
		this.server.to([data.senderUsername]).emit('closedInvitation');
	}

	@SubscribeMessage('inviteDenied')
	@UseGuards(GatewayGuard)
	handleInviteDenied(@ConnectedSocket() client: Socket, @MessageBody() data: { senderUsername: string }) {
		console.log("DENY")
		this.server.to([data.senderUsername]).emit('deniedInvitation');
	}

	@SubscribeMessage('message')
	@UseGuards(GatewayGuard)
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { dto: MessageDto, conversationName: string }) {

		const { dto, conversationName } = data;
		const user = client.handshake.auth.user;

		const verifyUser = await this.chatService.isUserInConversation(user.sub, dto.conversationID);
		if (verifyUser) {

			// The room's name is not the conversation's name in DB
			this.server.to(conversationName + dto.conversationID).except(`whoblocked${verifyUser.username}`).emit('onMessage', {
				from: verifyUser.username,
				senderId: user.sub,
				content: dto.content,
				post_datetime: dto.post_datetime,
				conversationID: dto.conversationID,
				conversationName: conversationName,
			});

			return ;
		}

		throw new HttpException("User not found", HttpStatus.NOT_FOUND);
	}

	@SubscribeMessage('addFriend')
	@UseGuards(GatewayGuard)
	async handleFriendRequest(@ConnectedSocket() client: Socket,  @MessageBody() data : { recipientLogin: string } ) {

		try {
			const { recipientLogin } = data;
			// user is the initiator of the friend request
			const user = client.handshake.auth.user;
			const username = await this.userService.getUsername(user.sub);
			if (!username)
				throw new HttpException('User not foud', HttpStatus.NOT_FOUND);
			this.server.to(recipientLogin).except(`whoblocked${username}`).emit('friendRequest', {
				recipientLogin: recipientLogin,
				initiatorID: Number(user.sub),
				initiatorLogin: username,
			});
			this.server.to(recipientLogin).except(`whoblocked${username}`).emit('refreshHeaderNotif');
		} catch (error) {
			throw error;
		}
	}

	@SubscribeMessage('friendRequestAccepted')
	@UseGuards(GatewayGuard)
	handleAcceptedFriendRequest(@MessageBody() data: { roomName: string, roomID: string, initiator: string, recipient: string }) {

		const { roomName, roomID, initiator, recipient } = data;
		this.server.to(initiator).emit('friendRequestAcceptedNotif', {
			roomName: roomName,
			roomID: roomID,
			recipient: recipient,
		})
		this.server.to(recipient).emit('refreshFriends');
		this.server.to(recipient).emit('refreshHeaderNotif');
	}

	/* REFRESH HANDLERS */

	@SubscribeMessage('banUser')
	@UseGuards(GatewayGuard)
	handleUserBan(@MessageBody() data: { userToBan: string, roomName: string, roomID: string }) {
		const { userToBan, roomName, roomID } = data;
		console.log(userToBan);
		this.server.to(userToBan).emit('userIsBan', {
			roomName: roomName,
			roomID: roomID,
		});
	}

	@SubscribeMessage('unbanUser')
	@UseGuards(GatewayGuard)
	handleUserUnban(@MessageBody() data: { userToUnban: string, roomName: string, roomID: string }) {
		const { userToUnban, roomName, roomID } = data;
		console.log(userToUnban);
		this.server.to(userToUnban).emit('userIsUnban', {
			roomName: roomName,
			roomID: roomID,
		});
	}

	@SubscribeMessage('deleteChannel')
	@UseGuards(GatewayGuard)
	handleDeleteChannel(@MessageBody() data: { roomName: string, roomID: string }) {
		const { roomName, roomID } = data;
		this.server.to(roomName + roomID).emit('channelDeleted', {
			roomName: roomName,
			roomID: roomID,
		});
	}

	@SubscribeMessage('kickUserFromChannel')
	@UseGuards(GatewayGuard)
	handleKickUser(@MessageBody() data: { userToKick: string, roomName: string, roomID: string }) {
		const { userToKick, roomName, roomID } = data;
		this.server.to(userToKick).emit('kickUser', {
			roomName: roomName,
			roomID: roomID,
		});
	}

	@SubscribeMessage('refreshUserChannelList')
	@UseGuards(GatewayGuard)
	handleRefresh(@MessageBody() data: { userToRefresh: string }) {
		const { userToRefresh } = data;
		this.server.to(userToRefresh).emit('refreshChannelList');
	}

	@SubscribeMessage('refreshChannelList')
	@UseGuards(GatewayGuard)
	handleRefreshChannel(@MessageBody() data: {roomName: string, roomID: string  } ) {
		const { roomName, roomID} = data;
		this.server.to(roomName + roomID).emit('refreshChannelListBis');
	}

	@SubscribeMessage('refreshUser')
	@UseGuards(GatewayGuard)
	handleUserRefresh(@MessageBody() data: { userToRefresh: string, target: string, status: boolean }) {
		const { userToRefresh, target, status } = data;
		this.server.to(userToRefresh).emit(target, status);
	}

	@SubscribeMessage('userJoinedChannel')
	@UseGuards(GatewayGuard)
	handleRefreshUserSearchList(@MessageBody() roomName: string) {
		this.server.to(roomName).emit('refreshChannelList');
	}

	@SubscribeMessage('refreshHeader')
	@UseGuards(GatewayGuard)
	handleRefreshheader() {
		this.server.emit('refreshHeaderNotif');
	}

	@SubscribeMessage('refreshUserList')
	@UseGuards(GatewayGuard)
	handleRefreshUserlList() {
		this.server.emit('refreshFriends');
		this.server.emit('refreshGlobalUserList');
		this.server.emit('refreshDmList');
	}

	@SubscribeMessage('emitNotification')
	@UseGuards(GatewayGuard)
	async handleNotif(@MessageBody() data: { channel: string, content: string, channelID: string }) {

		try {
			const { channel, content, channelID } = data;
			const dto = {
				from: 'Bot',
				content: content,
				post_datetime: new Date(),
				conversationID: channelID,
			};
			await this.chatService.saveNotification(dto);
			this.server.to(channel).emit('recv_notif', dto);
		} catch (error) {
			throw error;
		}
	}
}
