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
      console.log("Connected : ", socket.id);
    });
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any){
    console.log("socket: ", data);
    this.server.emit('onMessage', {
      msg: 'New message',
      content: data,
    });
  }
}
