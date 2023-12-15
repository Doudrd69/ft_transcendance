import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './game.controller';
import { Lobby } from './entities/lobby.entity';
import { User } from 'src/users/entities/users.entity';
import { Friendship } from 'src/users/entities/friendship.entity';
import { GameService } from './game.service';
import { LobbyService } from './matchmaking/matchmaking.service';

@Module({
  imports: [
      TypeOrmModule.forFeature([Lobby]),
      TypeOrmModule.forFeature([User]),
      TypeOrmModule.forFeature([Friendship]),
  ],
  controllers: [GameController],
  providers: [GameService, LobbyService],
  exports: [GameService],
})
export class GameModule {}
