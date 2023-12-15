import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
// import { OnModuleInit } from '@nestjs/common'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
	namespace: 'user',
	cors: {
		origin: ['http://localhost:3000']
	},
})

export class GeneralGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server: Server;

	private connectedUsers: { [userId: string]: Socket } = {};

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
		this.connectedUsers[client.id] = client;
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		delete this.connectedUsers[client.id];
	}

	@SubscribeMessage('joinRoom')
	async addUserToRoom(@MessageBody() dto: { roomName: string, userId: number }) {
		const { roomName, userId } = dto;

		// Vérifier si l'utilisateur est déjà dans une salle et le quitter
		const currentRoom = Object.keys(this.connectedUsers[userId]?.rooms || {})[1];
		if (currentRoom) {
			this.connectedUsers[userId]?.leave(currentRoom);
			console.log(`User left room: ${currentRoom}`);
		}

		// Rejoindre la nouvelle salle
		this.connectedUsers[userId]?.join(roomName);
		console.log(`User joined room: ${roomName}`);

		// Émettre un message pour confirmer l'entrée dans la salle
		this.server.to(roomName).emit('roomMessage', `Bienvenue dans la salle ${roomName}`);
	}

	@SubscribeMessage('message')
	handleMessage(@MessageBody() dto: any) {
		console.log("Sender is: ", dto.from);
		// this.server.to('user').emit(...)...
		this.server.emit('onMessage', {
			from: dto.from,
			content: dto.content,
			post_datetime: dto.post_datetime,
			conversationID: dto.conversationID,
		});
	}

	@SubscribeMessage('addFriend')
	handleFriendRequest(@MessageBody() dto: any) {
		this.server.emit('friendRequest', {
			recipientID: dto.recipientID,
			recipientLogin: dto.recipientLogin,
			initiatorLogin: dto.initiatorLogin,
		});
	}
}
