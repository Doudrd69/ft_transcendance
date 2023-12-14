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
    this.server.emit('friendRequest', {
      recipientID: dto.recipientID,
      recipientLogin: dto.recipientLogin,
      initiatorLogin: dto.initiatorLogin,
    });
  }
}

// postgres       | 2023-12-13 17:02:22.964 UTC [68] ERROR:  insert or update on table "user_to_group" violates foreign key constraint "FK_f0cafc8d737034145e69aeb2042"
// postgres       | 2023-12-13 17:02:22.964 UTC [68] DETAIL:  Key (group)=(5) is not present in table "conversation".
// postgres       | 2023-12-13 17:02:22.964 UTC [68] STATEMENT:  INSERT INTO "user_to_group"("user", "group") VALUES ($1, $2)
