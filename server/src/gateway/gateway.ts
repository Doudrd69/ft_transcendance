import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
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

	@SubscribeMessage('joinFriendRoom')
	async addUserToFriendRoom( @ConnectedSocket() client: Socket, @MessageBody() roomName: string ) {

		console.log("==== joinFriendRoom Event ====");
		console.log("Add ", client.id," to room : ", roomName);
		const conv = await this.chatService.getConversationByName(roomName);
		if (conv) {
			client.join(roomName + conv.id);
			return ;
		}
		console.log("Fatal error: conversation not found");
		return ;
	}

	@SubscribeMessage('joinRoom')
	addUserToRoom( @ConnectedSocket() client: Socket, @MessageBody() data: { roomName: string, roomID: string }, ) {

		const { roomName, roomID } = data;
		console.log("==== joinRoom Event ====");
		console.log("Add ", client.id," to room : ", roomName + roomID);
		client.join(roomName + roomID);
		this.server.to(roomName + roomID).emit('userJoinedRoom', `User has joined ${roomName}`);
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
		this.server.to(dto.conversationName + dto.conversationID).emit('onMessage', {
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
