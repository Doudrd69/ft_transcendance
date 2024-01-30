import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { GroupMember } from 'src/chat/entities/group_member.entity';
import { ChatService } from 'src/chat/chat.service';
import { UsersService } from 'src/users/users.service';
import { Conversation } from 'src/chat/entities/conversation.entity';
import { MessageDto } from 'src/chat/dto/message.dto';
import { GatewayGuard } from './Gatewayguard.guard';
import { UseGuards } from '@nestjs/common'

@WebSocketGateway({
	namespace: 'user',
	cors: {
		origin: ['http://localhost:3000', 'http://10.12.11.2:3000']
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
	}

	private async userLeavesRooms(client: Socket, userID: number) {
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
	}

	private async notifyFriendList(userID: number, personnalRoom: string, event: string, status: string) {

		const user = await this.userService.getUserByID(userID);
		if (user) {
			const friends = await this.userService.getFriendships(user.username);
			if (friends) {
				friends.forEach((friend: any) => {
					console.log("Notifying ", friend.username);
					this.server.except(personnalRoom).to(friend.username).emit(event, `${personnalRoom} is ${status}`);
				});
			}
		}

		return ;
	}

	handleConnection(client: Socket) {

		console.log(`---> GeneralGtw client connected    : ${client.id}`);
		// client got the auth.token payload, we will know if connection is good
		this.connectedUsers[client.id] = client;
		
		client.on('joinPersonnalRoom', (personnalRoom: string, userID: number) => {
			client.join(personnalRoom);
			console.log("Client ", client.id, " has joined ", personnalRoom, " room");
			this.userRejoinsRooms(client, userID);
			this.userService.updateUserStatus(userID, true);
			this.notifyFriendList(userID, personnalRoom, 'newConnection', 'online');

			client.on('disconnect', () => {
				console.log("===> Disconnecting user ", personnalRoom, " with ID ", userID);
				this.notifyFriendList(userID, personnalRoom , 'newDeconnection', 'offline');
				// this.server.except(personnalRoom).emit('newDeconnection', `${personnalRoom} is now offline`);
				client.leave(personnalRoom);
				console.log("Client ", client.id, " has left ", personnalRoom, " room");
				this.userLeavesRooms(client, userID);
				this.userService.updateUserStatus(userID, false);
			})

		});
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

	@SubscribeMessage('inviteToGame')
	@UseGuards(GatewayGuard)
	inviteUserToGame( @MessageBody() data: { usernameToInvite: string, senderID: string, senderUsername: string, senderUserID: number } ) {
		const { usernameToInvite, senderID, senderUsername, senderUserID } = data;
		console.log("Inviting ", usernameToInvite," to game");
		console.log("-----> ",  usernameToInvite, senderID, senderUsername, "ho :", senderUserID);
		this.server.to(usernameToInvite).emit('gameInvite', {
			senderUserID: senderUserID,
			senderID: senderID,
			senderUsername: senderUsername,
		});
	}

	@SubscribeMessage('message')
	@UseGuards(GatewayGuard)
	async handleMessage( @MessageBody() data: { dto: MessageDto, conversationName: string } ) {

		const { dto, conversationName } = data;
		// console.log("Message sent to: ", conversationName + dto.conversationID);

		// The room's name is not the conversation's name in DB
		this.server.to(conversationName + dto.conversationID).except(`whoblocked${dto.from}`).emit('onMessage', {
			from: dto.from,
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

	@SubscribeMessage('refreshChannel')
	@UseGuards(GatewayGuard)
	handleChannelrRefresh(@MessageBody() data: { channel: string } ) {
		const { channel } = data;
		console.log("refreshing channel");
		this.server.to(channel).emit('refresh_channel');
	}

	@SubscribeMessage('emitNotification')
	@UseGuards(GatewayGuard)
	async handleNotif(@MessageBody() data: { channel: string, content: string, channelID: string} ) {
		console.log("aakajajajaajajaj");
		const { channel, content, channelID } = data;
		const dto = {
			from: 'Bot',
			content: content,
			post_datetime: new Date(),
			conversationID: channelID,
		};
		await this.chatService.saveNotification(dto);
		this.server.to(channel).emit('recv_notif', dto);
	}
}
