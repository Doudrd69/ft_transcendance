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

  // ajouter event pour join le socket du nouveau user dans le channel
  // socket.join([conversationID]);
  // io.to(conversationID).emit("A new user has joined the room"); // diffusion à tous ceux présents dans la room
  @SubscribeMessage('joinRoom')
  addUserToRoom(@MessageBody() dto: any) {
    const socket = dto.socket;
    socket.join([dto.id]);
    this.server.to(dto.id).emit("A new user has joined!");
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
    console.log("DTO in gateway: ", dto);
    this.server.emit('friendRequest', {
      initiator: dto.initiatorLogin,
      recipient: dto.recipientLogin,
    });
  }
}
