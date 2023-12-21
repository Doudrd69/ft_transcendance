import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { GroupMember } from 'src/chat/entities/group_member.entity';
import { ChatService } from 'src/chat/chat.service';
import { UsersService } from 'src/users/users.service';
import { Conversation } from 'src/chat/entities/conversation.entity';

@WebSocketGateway({
	namespace: 'user',
	cors: {
		origin: ['http://localhost:3000']
	},
})

// penser a creer un dossier pour les dto de la gateway

export class GeneralGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private chatService: ChatService,
		private userService: UsersService,
	) {}

	@WebSocketServer()
	server: Server;

	private connectedUsers: { [userId: string]: Socket } = {};

	handleConnection(client: Socket) {
		console.log(`---> GeneralGtw client connected    : ${client.id}`);
		this.connectedUsers[client.id] = client;
		// is Active update here?
	}
	
	handleDisconnect(client: Socket) {
		console.log(`===> GeneralGtw client disconnected : ${client.id}`);
		delete this.connectedUsers[client.id];
		// await this.userservice.updateUserStatus(userID, false);
	}

	// This event will create a room for the user, to join its current socket
	@SubscribeMessage('joinPersonnalRoom')
	handleUserPersonnalRoom( @ConnectedSocket() client: Socket, @MessageBody() personnalRoom: string, userID?: number ) {
		client.join(personnalRoom);
		console.log("Client ", client.id, " has joined ", personnalRoom, " room");
		this.userService.updateUserStatus(userID, true);
	}

	// This event will create a room for the user, to join its current socket
	@SubscribeMessage('leavePersonnalRoom')
	handleUserLeavePersonnalRoom( @ConnectedSocket() client: Socket, @MessageBody() personnalRoom: string, userID?: number ) {
		client.leave(personnalRoom);
		console.log("Client ", client.id, " has left ", personnalRoom, " room");
		this.userService.updateUserStatus(userID, false);
	}

	// This event let a user to join back his conversations, because when he comes back after a deconnection,
	// his socket will change, so we add it back to the rooms
	@SubscribeMessage('rejoinRooms')
	async handleUserJoinsRooms( @ConnectedSocket() client: Socket, @MessageBody() userID: number ) {
		const conversations = await this.chatService.getConversations(userID);
		if (conversations) {
			let ids = <number[]>[];
			conversations.forEach(function (value) {
				ids.push(value.id);
			});

			const conv = await this.chatService.getConversationArrayByID(ids);
			conv.forEach(function (value) {
				client.join(value.name);
			})
		}
	}

	@SubscribeMessage('leaveRooms')
	async handleUserLeavesRooms( @ConnectedSocket() client: Socket, @MessageBody() userID: number ) {
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

	@SubscribeMessage('joinRoom')
	addUserToRoom( @ConnectedSocket() client: Socket, @MessageBody() roomName: string ) {

		console.log("==== joinRoom Event ====");
		console.log("Add ", client.id," to room : ", roomName);

		client.join(roomName);
		this.server.to(roomName).emit('userJoinedRoom');
		// // Vérifier si l'utilisateur est déjà dans une salle et la quitter si jamais
		// const currentRoom = Object.keys(this.connectedUsers[userId]?.rooms || {})[1];
		// if (currentRoom) {
		// 	this.connectedUsers[userId]?.leave(currentRoom);
		// 	console.log(`User left room: ${currentRoom}`);
		// }
		// // Rejoindre la nouvelle salle
		// this.connectedUsers[userId]?.join(roomName);
		// console.log(`User joined room: ${roomName}`);
		// // Émettre un message pour confirmer l'entrée dans la salle
		// this.server.to(roomName).emit('roomMessage', `Bienvenue dans la salle ${roomName}`);
	}

	@SubscribeMessage('message')
	handleMessage(@MessageBody() dto: any) {
		console.log("okay many = ", dto.conversationName);
		this.server.to(dto.conversationName).emit('onMessage', {
			from: dto.from,
			content: dto.content,
			post_datetime: dto.post_datetime,
			conversationID: dto.conversationID,
			conversationName: dto.conversationName,
		});
	}

	@SubscribeMessage('addFriend')
	handleFriendRequest(@MessageBody() dto: any) {
		this.server.to(dto.recipientLogin).emit('friendRequest', {
			recipientID: dto.recipientID,
			recipientLogin: dto.recipientLogin,
			initiatorLogin: dto.initiatorLogin,
		});
	}

	@SubscribeMessage('friendRequestAccepted')
	handleAcceptedFriendRequest(@MessageBody() dto: any) {
		this.server.to(dto.initiatorLogin).emit('friendRequestAcceptedNotif', {
			recipientID: dto.recipientID,
			recipientLogin: dto.recipientLogin,
			initiatorLogin: dto.initiatorLogin,
		})
	}
}
