import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { User } from '../users/entities/users.entity'
import { Friendship } from 'src/users/entities/friendship.entity';
import { GroupMember } from './entities/group_member.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Conversation]),
		TypeOrmModule.forFeature([Message]),
		TypeOrmModule.forFeature([User]),
		TypeOrmModule.forFeature([Friendship]),
		TypeOrmModule.forFeature([GroupMember]),
		forwardRef(() => UsersModule),
	],
	providers: [ChatService, UsersService],
	exports: [ChatService],
	controllers: [ChatController],
})
export class ChatModule {}