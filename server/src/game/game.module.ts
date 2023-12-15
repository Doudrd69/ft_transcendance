import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lobby } from './entities/lobby.entity';
import { UsersService } from 'src/users/users.service';
import { UsersController } from 'src/users/users.controller';
import { User } from 'src/users/entities/users.entity';
import { Friendship } from 'src/users/entities/friendship.entity';
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
