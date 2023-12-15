import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { OnModuleInit } from '@nestjs/common'

@WebSocketGateway({
	namespace: 'user',
	cors: {
		origin: ['http://localhost:3000']
	},
})

// penser a creer un dossier pour les dto de la gateway

export class GeneralGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server: Server;

	private connectedUsers: { [userId: string]: Socket } = {};

	handleConnection(client: Socket) {
		console.log(`---> GeneralGtw client connected    : ${client.id}`);
		this.connectedUsers[client.id] = client;
	}

	handleDisconnect(client: Socket) {
		console.log(`===> GeneralGtw client disconnected : ${client.id}`);
		delete this.connectedUsers[client.id];
	}

	@SubscribeMessage('joinPersonnalRoom')
	handleUserPersonnalRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() personnalRoom: string,
	) {
		client.join(personnalRoom);
		console.log("Client ", client.id, " has joined ", personnalRoom, " room");
	}

	@SubscribeMessage('joinRoom')
	addUserToRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() roomName: string,
	) {

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
		this.server.to(dto.conversationName).emit('onMessage', {
			from: dto.from,
			content: dto.content,
			post_datetime: dto.post_datetime,
			conversationID: dto.conversationID,
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