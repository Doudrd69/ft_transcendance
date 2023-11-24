import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

export enum ClientEvents
{
  Ping = 'client.ping',
}

export enum ServerEvents
{
  Pong = 'server.pong',
}

@WebSocketGateway()
export class GameGateway
{
  @SubscribeMessage(ClientEvents.Ping)
  onPing(client: Socket): void
  {
    client.emit(ServerEvents.Pong, {
      message: 'pong',
    });
  }
  
  handleConnection(client: Socket) {
    console.log(`Client ${client.id} connected.`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected.`);
  }
}