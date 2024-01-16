import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { GroupMember } from 'src/chat/entities/group_member.entity';
import { ChatService } from 'src/chat/chat.service';
import { UsersService } from 'src/users/users.service';
import { Conversation } from 'src/chat/entities/conversation.entity';
import { MessageDto } from 'src/chat/dto/message.dto';

@WebSocketGateway({
	namespace: 'user',
	cors: {
		origin: ['http://localhost:3000']
	},
})

// quand ton client se connecte, il rejoin les rooms des gens qu il a bloque
// join(whoblockedUSERLOGIN)
// to('room').except("WhoBlocked#senderId") (tu connais senderId)
// reste a implementer dans le front les events au moment du fetch pour tout se suite rejoindre/qutter les rooms de block
// creer un dossier pour les dto de la gateway

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

	handleConnection(client: Socket) {

		console.log(`---> GeneralGtw client connected    : ${client.id}`);
		this.connectedUsers[client.id] = client;

		client.on('joinPersonnalRoom', (personnalRoom: string, userID: number) => {
			client.join(personnalRoom);
			console.log("Client ", client.id, " has joined ", personnalRoom, " room");
			this.userRejoinsRooms(client, userID);
			this.userService.updateUserStatus(userID, true);

			client.on('disconnect', () => {
				console.log("===> Disconnecting user ", personnalRoom, " with ID ", userID);
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
	addUserToRoom( @ConnectedSocket() client: Socket, @MessageBody() data: { roomName: string, roomID: string } ) {

		const { roomName, roomID } = data;
		console.log("==== joinRoom Event ====");
		console.log("Add ", client.id," to room : ", roomName + roomID);

		client.join(roomName + roomID);
		this.server.to(roomName + roomID).emit('userJoinedRoom', `User has joined ${roomName}${roomID}`);

		return ;
	}

	@SubscribeMessage('leaveRoom')
	leaveRoom( @ConnectedSocket() client: Socket, @MessageBody() data: { roomName: string, roomID: string } ) {

		const { roomName, roomID } = data;
		console.log("==== leaveRoom Event ====");
		console.log("Remove ", client.id," from room : ", roomName + roomID);

		client.leave(roomName + roomID);
		return ;
	}

	@SubscribeMessage('addUserToRoom')
	addUserToNewRoom( @MessageBody() data: { convID: number, convName: string, friend: string} ) {
		const { convID, convName, friend } = data;
		console.log("==== addUserToRoom Event ====");
		console.log("Add ", friend," to room : ", convName + convID);
		this.server.to(friend).emit('userAddedToFriendRoom', {
			convID: convID,
			convName: convName,
		});
	}

	@SubscribeMessage('banUser')
	handleUserBan(@MessageBody() data: { userToBan: string, roomName: string, roomID: string } ) {
		const { userToBan, roomName, roomID } = data;
		console.log(userToBan);
		this.server.to(userToBan).emit('userIsBan', {
			roomName: roomName,
			roomID: roomID,
		});
	}

	@SubscribeMessage('unbanUser')
	handleUserUnban(@MessageBody() data: { userToUnban: string, roomName: string, roomID: string } ) {
		const { userToUnban, roomName, roomID } = data;
		console.log(userToUnban);
		this.server.to(userToUnban).emit('userIsUnban', {
			roomName: roomName,
			roomID: roomID,
		});
	}

	@SubscribeMessage('message')
	handleMessage(@MessageBody() data: { dto: MessageDto, conversationName: string } ) {

		const { dto, conversationName } = data;
		console.log("Message sent to: ", conversationName + dto.conversationID);

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
	handleFriendRequest(@MessageBody() dto: any) {
		this.server.to(dto.recipientLogin).emit('friendRequest', {
			recipientLogin: dto.recipientLogin,
			initiatorLogin: dto.initiatorLogin,
		});
	}

	// faut aussi, peut etre le nom de celui qui a accepte mdr
	@SubscribeMessage('friendRequestAccepted')
	handleAcceptedFriendRequest(@MessageBody() data: { roomName: string, roomID: string, initiator: string, recipient: string } ) {
		const { roomName, roomID, initiator, recipient } = data;
		this.server.to(initiator).emit('friendRequestAcceptedNotif', {
			roomName: roomName,
			roomID: roomID,
			initiator: initiator,
			recipient: recipient,
		})
	}
}
