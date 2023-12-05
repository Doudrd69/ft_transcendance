import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { GroupMember } from './entities/group_member.entity';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { User } from '../users/entities/users.entity'
import { SocketGateway } from './chat.socket.gateway';

@Module({
	imports: [
		TypeOrmModule.forFeature([Conversation]),
		TypeOrmModule.forFeature([GroupMember]),
		TypeOrmModule.forFeature([Message]),
		TypeOrmModule.forFeature([User])
	],
	providers: [ChatService ,SocketGateway],
	exports: [ChatService],
	controllers: [ChatController],
})
export class ChatModule {}