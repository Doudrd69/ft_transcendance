import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: ['http://localhost:3000']
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;
  

  @SubscribeMessage('joinMatchmaking')
  handleJoinMatchmaking(client: Socket, user: any): void {
    // Traitez ici la logique pour ajouter le joueur à la file d'attente (similaire à votre implémentation précédente)
  }

  // Ajoutez d'autres méthodes pour gérer les événements Socket.io liés au matchmaking
}