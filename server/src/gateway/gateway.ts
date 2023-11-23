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
  handleMessage(@MessageBody() dto: any){
    console.log("Sender: ", dto.from_login);
    this.server.emit('onMessage', {
      msg: 'New message',
      content: dto.content,
      date: dto.post_datetime,
    });
  }
}
