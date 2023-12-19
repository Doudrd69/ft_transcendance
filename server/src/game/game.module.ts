import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { UsersController } from 'src/users/users.controller';
import { User } from 'src/users/entities/users.entity';
import { Friendship } from 'src/users/entities/friendship.entity';
import { MatchmakingService } from './matchmaking/matchmaking.service';
import { ChatService } from 'src/chat/chat.service';
import { Conversation } from 'src/chat/entities/conversation.entity';
import { Game } from './entities/games.entity';
import { GameGateway } from 'src/game_gateway/game.gateway';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  imports: [
      TypeOrmModule.forFeature([User]),
      TypeOrmModule.forFeature([Friendship]),
      TypeOrmModule.forFeature([Game]),
      // TypeOrmModule.forFeature([Conversation]),
  ],
  controllers: [GameController],
  providers: [GameGateway, GameService, MatchmakingService],
  exports: [GameService],
})
export class GameModule {
}
