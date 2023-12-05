import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { User } from '../users/entities/users.entity'
import { GeneralGateway } from 'src/gateway/gateway';
import { Friendship } from 'src/users/entities/friendship.entity';
import { UsersService } from 'src/users/users.service';
import { GroupMember } from './entities/group_member.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Conversation]),
		TypeOrmModule.forFeature([Message]),
		TypeOrmModule.forFeature([User]),
		TypeOrmModule.forFeature([Friendship]),
		TypeOrmModule.forFeature([GroupMember])
	],
<<<<<<< HEAD
	providers: [ChatService, UsersService],
=======
	providers: [ChatService ,SocketGateway],
>>>>>>> f154292 (Oh misere)
	exports: [ChatService],
	controllers: [ChatController],
})
export class ChatModule {}