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
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameEngine } from './entities/gameEngine.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([User]),
      TypeOrmModule.forFeature([Friendship]),
      TypeOrmModule.forFeature([Game]),
      TypeOrmModule.forFeature([GameEngine]),
  ],
  controllers: [GameController],
  providers: [GameService, MatchmakingService],
  exports: [GameService],
})
export class GameModule {
}
