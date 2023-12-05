import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class SocketGateway {
  @WebSocketServer() server: Server;

  handleConnection(client: any) {
    console.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client déconnecté: ${client.id}`);
  }
  @SubscribeMessage('chatMessage')
  handleMessage(client: any, data: string) {
    // Traitez les données reçues et envoyez une réponse
    this.server.to(client.id).emit('responseMessage', `Message reçu : ${data}`);
  }
}