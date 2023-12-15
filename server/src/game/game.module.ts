import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lobby } from './entities/lobby.entity';
import { UsersService } from 'src/users/users.service';
import { UsersController } from 'src/users/users.controller';
import { User } from 'src/users/entities/users.entity';
import { Friendship } from 'src/users/entities/friendship.entity';
import { LobbyService } from './matchmaking/matchmaking.service';
import { ChatService } from 'src/chat/chat.service';
import { Conversation } from 'src/chat/entities/conversation.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Lobby]),
      TypeOrmModule.forFeature([User]),
      TypeOrmModule.forFeature([Friendship]),
      // TypeOrmModule.forFeature([Conversation]),
  ],
  controllers: [GameController],
  providers: [GameGateway, GameService, LobbyService],
  exports: [GameService],
})
export class GameModule {}
