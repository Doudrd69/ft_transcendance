import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common'
import { Server } from 'socket.io'

@WebSocketGateway()
export class GeneralGateway implements OnModuleInit {

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log("Connected");
    });
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any){
    console.log(data);
    this.server.emit('onMessage', {
      msg: 'New message',
      content: data,
    });
  }
}
