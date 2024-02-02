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
	) {}

	@WebSocketServer()
	server: Server;

	private connectedUsers: { [userId: string]: Socket } = {};

	private  async userRejoinsRooms(client: Socket, userID: number) {

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

	private async notifyFriendList(userID: number, personnalRoom: string, event: string, status: string) {

		const user = await this.userService.getUserByID(userID);
		console.log(user);
		if (user) {

			const friends = await this.userService.getFriendships(userID);
			if (friends) {

				friends.forEach((friend: any) => {
					console.log("Notifying ", friend.username, " on event ", event);
					this.server.except(personnalRoom).to(friend.username).emit(event, `${personnalRoom} is ${status}`);
				});

				return ;
			}
		}

		throw new HttpException('User not found', HttpStatus.NOT_FOUND);
	}

	handleConnection(client: Socket) {

		try {
			
			console.log(`---> GeneralGtw client connected    : ${client.id}`);
			this.connectedUsers[client.id] = client;
	
			client.on('joinPersonnalRoom', (personnalRoom: string, userID: number) => {

				client.join(personnalRoom);
				console.log("Client ", client.id, " has joined ", personnalRoom, " room");
				this.userRejoinsRooms(client, userID);
				this.userService.updateUserStatus(userID, true);
				this.notifyFriendList(userID, personnalRoom, 'newConnection', 'online');
				this.server.emit('newUser');
		
				client.on('disconnect', () => {
					console.log("===> Disconnecting user ", personnalRoom, " with ID ", userID);
					this.notifyFriendList(userID, personnalRoom , 'newDeconnection', 'offline');
					client.leave(personnalRoom);
					console.log("Client ", client.id, " has left ", personnalRoom, " room");
					this.userLeavesRooms(client, userID);
					this.userService.updateUserStatus(userID, false);
				})
		
			});
		} catch (error) {
			console.log(' == Gatewway: ', error);
		}
	}
	
	handleDisconnect(client: Socket) {
		console.log(`===> GeneralGtw client disconnected : ${client.id}`);
		delete this.connectedUsers[client.id];
	}

	@SubscribeMessage('joinRoom')
	@UseGuards(GatewayGuard)
	addUserToRoom( @ConnectedSocket() client: Socket, @MessageBody() data: { roomName: string, roomID: string } ) {

		const { roomName, roomID } = data;
		console.log("==== joinRoom Event ====");
		console.log("Add ", client.id," to room : ", roomName + roomID);

		if (roomID)
			client.join(roomName + roomID);
		else
			client.join(roomName);

		const notif = {
			from: 'Server',
			content: `${client.id} has joined the conversation!`,
			post_datetime: new Date(),
			conversationID: roomID,
		}

		this.server.to(roomName + roomID).emit('userJoinedRoom', notif);

		return ;
	}

	@SubscribeMessage('leaveRoom')
	@UseGuards(GatewayGuard)
	leaveRoom( @ConnectedSocket() client: Socket, @MessageBody() data: { roomName: string, roomID: string } ) {

		const { roomName, roomID } = data;
		console.log("==== leaveRoom Event ====");
		console.log("Remove ", client.id," from room : ", roomName + roomID);

		if (roomID)
			client.leave(roomName + roomID);
		else
			client.leave(roomName);
		return ;
	}

	@SubscribeMessage('addUserToRoom')
	@UseGuards(GatewayGuard)
	addUserToNewRoom( @MessageBody() data: { convID: number, convName: string, friend: string} ) {
		const { convID, convName, friend } = data;
		console.log("==== addUserToRoom Event ====");
		console.log("Emit to add ", friend," to room : ", convName + convID);
		this.server.to(friend).emit('userAddedToRoom', {
			convID: convID,
			convName: convName,
		});
	}

	@SubscribeMessage('checkSenderInMatch')
	@UseGuards(GatewayGuard)
	async checkIfSendInMatch(@MessageBody() data: { senderUsername: string, senderUserId: number } ) {

		try {
			if (await this.userService.userToInviteGameIsAlreadyInGame(data.senderUserId)) {
				console.log(`sender already inGame`);
				this.server.to(data.senderUsername).emit('senderInGame');
				return;
			}
			this.server.to(data.senderUsername).emit('senderNotInGame');
		} catch (error) {
			throw error;
		}
	}

	@SubscribeMessage('inviteToGame')
	@UseGuards(GatewayGuard)
	async inviteUserToGame(@ConnectedSocket() client: Socket, @MessageBody() data: { usernameToInvite: string, userIdToInvite: number, senderID: string, senderUsername: string, senderUserID: number } ) {
		
		try {
			const { usernameToInvite, userIdToInvite, senderID, senderUsername, senderUserID } = data;
			if (await this.userService.userToInviteGameIsAlreadyInGame(userIdToInvite))
			{
				this.server.to(senderUsername).emit('userToInviteAlreadyInGame');
				return;
			}
			console.log("Inviting ", usernameToInvite," to game");
			console.log("-----> ",  usernameToInvite, senderID, senderUsername, "ho :", senderUserID);
			this.server.to(usernameToInvite).emit('gameInvite', {
				senderUserID: senderUserID,
				senderID: senderID,
				senderUsername: senderUsername,
			});
		} catch (error) {
			throw error;
		}
	}

	@SubscribeMessage('inviteClosed')
	@UseGuards(GatewayGuard)
    handleInviteClosed(@ConnectedSocket() client: Socket, @MessageBody() data: {senderUsername: string}) {
        console.log("CLOSED")
        this.server.to([data.senderUsername]).emit('closedInvitation');
    }

    @SubscribeMessage('inviteDenied')
	@UseGuards(GatewayGuard)
    handleInviteDenied(@ConnectedSocket() client: Socket, @MessageBody() data: {senderUsername: string}) {
        console.log("DENY")
        this.server.to([data.senderUsername]).emit('deniedInvitation');
    }

	@SubscribeMessage('message')
	@UseGuards(GatewayGuard)
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { dto: MessageDto, conversationName: string } ) {

		const { dto, conversationName } = data;
		const user = client.handshake.auth.user;

		// The room's name is not the conversation's name in DB
		this.server.to(conversationName + dto.conversationID).except(`whoblocked${dto.from}`).emit('onMessage', {
			from: dto.from,
			senderId: user.sub,
			content: dto.content,
			post_datetime: dto.post_datetime,
			conversationID: dto.conversationID,
			conversationName: conversationName,
		});
	}

	// je peux aussi utiliser la liste userBlocked pour except les demandes d'amis
	@SubscribeMessage('addFriend')
	@UseGuards(GatewayGuard)
	handleFriendRequest(@MessageBody() dto: any) {
		this.server.to(dto.recipientLogin).except(`whoblocked${dto.initiatorLogin}`).emit('friendRequest', {
			recipientLogin: dto.recipientLogin,
			initiatorLogin: dto.initiatorLogin,
		});
	}

	// faut aussi, peut etre le nom de celui qui a accepte mdr
	@SubscribeMessage('friendRequestAccepted')
	@UseGuards(GatewayGuard)
	handleAcceptedFriendRequest(@MessageBody() data: { roomName: string, roomID: string, initiator: string, recipient: string } ) {
		const { roomName, roomID, initiator, recipient } = data;
		this.server.to(initiator).emit('friendRequestAcceptedNotif', {
			roomName: roomName,
			roomID: roomID,
			initiator: initiator,
			recipient: recipient,
		})
		this.server.to(recipient).emit('refreshFriends');
	}

	/* REFRESH HANDLERS */

	@SubscribeMessage('banUser')
	@UseGuards(GatewayGuard)
	handleUserBan(@MessageBody() data: { userToBan: string, roomName: string, roomID: string } ) {
		const { userToBan, roomName, roomID } = data;
		console.log(userToBan);
		this.server.to(userToBan).emit('userIsBan', {
			roomName: roomName,
			roomID: roomID,
		});
	}

	@SubscribeMessage('unbanUser')
	@UseGuards(GatewayGuard)
	handleUserUnban(@MessageBody() data: { userToUnban: string, roomName: string, roomID: string } ) {
		const { userToUnban, roomName, roomID } = data;
		console.log(userToUnban);
		this.server.to(userToUnban).emit('userIsUnban', {
			roomName: roomName,
			roomID: roomID,
		});
	}

	@SubscribeMessage('deleteChannel')
	@UseGuards(GatewayGuard)
	handleDeleteChannel(@MessageBody() data: { roomName: string, roomID: string } ) {
		const { roomName, roomID } = data;
		console.log("Emitting to ", roomName + roomID);
		// recup channelUserList et emit sur chaque user?
		this.server.to(roomName + roomID).emit('channelDeleted', {
			roomName: roomName,
			roomID: roomID,
		});
	}

	@SubscribeMessage('kickUserFromChannel')
	@UseGuards(GatewayGuard)
	handleKickUser(@MessageBody() data: { userToKick: string, roomName: string, roomID: string } ) {
		const { userToKick, roomName, roomID } = data;
		this.server.to(userToKick).emit('kickUser', {
			roomName: roomName,
			roomID: roomID,
		});
	}

	@SubscribeMessage('refreshUserChannelList')
	@UseGuards(GatewayGuard)
	handleRefresh(@MessageBody() data: { userToRefresh: string } ) {
		const { userToRefresh } = data;
		this.server.to(userToRefresh).emit('refreshChannelList');
	}

	@SubscribeMessage('refreshChannelList')
	@UseGuards(GatewayGuard)
	handleRefreshChannel(@MessageBody() data: {roomName: string, roomID: string  } ) {
		console.log("refreshing channel list");
		const { roomName, roomID} = data;
		this.server.to(roomName + roomID).emit('refreshChannelListBis');
	}
	@SubscribeMessage('refreshUser')
	@UseGuards(GatewayGuard)
	handleUserRefresh(@MessageBody() data: { userToRefresh: string, target: string, status: boolean } ) {
		const { userToRefresh, target, status } = data;
		this.server.to(userToRefresh).emit(target, status);
	}

	@SubscribeMessage('userJoinedChannel')
	@UseGuards(GatewayGuard)
	handleRefreshUserSearchList(@MessageBody() roomName: string) {
		this.server.to(roomName).emit('refreshChannelList');
	}

	@SubscribeMessage('emitNotification')
	@UseGuards(GatewayGuard)
	async handleNotif(@MessageBody() data: { channel: string, content: string, channelID: string} ) {

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
