import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket, io } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000']
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;


  const gameSocket = io.of("/game");
  
  gameSocket.on("connection", socket => {
    console.log("someone connected");
  });
  gameSocket.emit("hi", "everyone!");

  @SubscribeMessage('joinMatchmaking')
  handleJoinMatchmaking(client: Socket, user: any): void {
    // Traitez ici la logique pour ajouter le joueur à la file d'attente (similaire à votre implémentation précédente)
  }

  // Ajoutez d'autres méthodes pour gérer les événements Socket.io liés au matchmaking
}