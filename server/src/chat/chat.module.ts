import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { GroupMember } from './entities/group_member.entity';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Conversation]),
		TypeOrmModule.forFeature([GroupMember]),
		TypeOrmModule.forFeature([Message])
	],
	providers: [ChatService],
	exports: [ChatService],
	controllers: [ChatController],
})
export class ChatModule {}