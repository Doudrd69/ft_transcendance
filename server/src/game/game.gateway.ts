import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
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
  

  afterInit(server: Server) {
    console.log('GameNamespace initialized');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Game connected mama: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Game disconnected mama: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, data: string): void {
    this.server.emit('message', data); // Diffuse à tous les clients dans le namespace 'game'
  }

  @SubscribeMessage('joinMatchmaking')
  handleJoinMatchmaking(client: Socket, user: any): void {
    console.log("JOINMATCHMAKING");
    // Traitez ici la logique pour ajouter le joueur à la file d'attente (similaire à votre implémentation précédente)
  }

  // Ajoutez d'autres méthodes pour gérer les événements Socket.io liés au matchmaking
}