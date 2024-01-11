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

// creer un dossier pour les dto de la gateway ?

export class GeneralGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private chatService: ChatService,
		private userService: UsersService,
	) {}

	@WebSocketServer()
	server: Server;

	private connectedUsers: { [userId: string]: Socket } = {};

	private  async userRejoinsRooms(client: Socket, userID: number ) {
		const conversations = await this.chatService.getConversations(userID);
		if (conversations) {
			let ids = <number[]>[];
			conversations.forEach(function (value) {
				ids.push(value.id);
			});
	
			const conv = await this.chatService.getConversationArrayByID(ids);
			conv.forEach(function (value) {
				client.join(value.name + value.id);
			})
		}
	}

	private async userLeavesRooms(client: Socket, userID: number ) {
		const conversations = await this.chatService.getConversations(userID);
		if (conversations) {
			let ids = <number[]>[];
			conversations.forEach(function (value) {
				ids.push(value.id);
			});

			const conv = await this.chatService.getConversationArrayByID(ids);
			conv.forEach(function (value) {
				client.leave(value.name);
			})
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

	@SubscribeMessage('addUserToRoom')
	addUserToNewRoom( @MessageBody() data: { convID: number, convName: string, friend: string} ) {
		const { convID, convName, friend } = data;
		this.server.to(friend).emit('userAddedToFriendRoom', {
			convID: convID,
			convName: convName,
		});
	}

	@SubscribeMessage('message')
	handleMessage(@MessageBody() data: { dto: MessageDto, conversationName: string } ) {

		const { dto, conversationName } = data;
		console.log("Message sent to: ", conversationName + dto.conversationID);

		// The room's name is not the conversation's name in DB
		this.server.to(conversationName + dto.conversationID).emit('onMessage', {
			from: dto.from,
			content: dto.content,
			post_datetime: dto.post_datetime,
			conversationID: dto.conversationID,
			conversationName: conversationName,
		});
	}

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
