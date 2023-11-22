import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common'
import { Server } from 'socket.io'

@WebSocketGateway({
  namespace: 'user',
  cors: {
    origin: ['http://localhost:3000']
  },
})
export class GeneralGateway implements OnModuleInit {

  @WebSocketServer()
  server: Server;
  
  onModuleInit() {
    this.server.on('connect', (socket) => {
      console.log("User Connected : ", socket.id);
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
    console.log("Friend request initiated by ", dto.initiatorLogin);
    this.server.emit('friendRequest', {
      initiator: dto.initiatorLogin,
      recipient: dto.recipientLogin,
    });
  }
}
