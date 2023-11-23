import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common'
import { Server } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000']
  },
})

export class GeneralGateway implements OnModuleInit {

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connect', (socket) => {
      console.log("Client is connecting...");
      if (socket.connected)
        console.log("Client connected: ", socket.id);
    });
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() dto: any) {
    console.log("Sender is: ", dto.from);
    this.server.emit('onMessage', {
      from: dto.from,
      content: dto.content,
      post_datetime: dto.post_datetime,
      conversationName: dto.conversationName,
    });
  }

  @SubscribeMessage('addFriend')
  handleFriendRequest(@MessageBody() dto: any) {
    console.log("DTO in gateway: ", dto);
    this.server.emit('friendRequest', {
      initiator: dto.initiatorLogin,
      recipient: dto.recipientLogin,
    });
  }
}