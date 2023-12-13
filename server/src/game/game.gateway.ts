import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody } from '@nestjs/websockets';
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

  @SubscribeMessage('Game')
  handleGame(@ConnectedSocket() client: Socket, data: string): void {
    this.server.emit('message', data); // Diffuse à tous les clients dans le namespace 'game'
  }

  @SubscribeMessage('joinLobby')
  handleJoinLobby(client: Socket, data: string): string {
    console.log("JOINMATCHMAKING");
    return (data); // a changer
  }

}   