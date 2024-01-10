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
import { Paddle } from './entities/paddle.entity';
import { PaddleService } from './gameObject/paddle.service';
import { Ball } from './entities/ball.entity';
import { BallService } from './gameObject/ball.service';
import { Vector } from './entities/vector.entity';
import { VectorService } from './gameObject/vector.service';

@Module({
  imports: [
      TypeOrmModule.forFeature([User]),
      TypeOrmModule.forFeature([Friendship]),
      TypeOrmModule.forFeature([Game]),
      TypeOrmModule.forFeature([GameEngine]),
      TypeOrmModule.forFeature([Paddle]),
      TypeOrmModule.forFeature([Ball]),
      TypeOrmModule.forFeature([Vector]),
  ],
  controllers: [GameController],
  providers: [GameService, MatchmakingService, PaddleService, BallService, VectorService],
  exports: [GameService],
})
export class GameModule {
}
