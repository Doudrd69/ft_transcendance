import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { UsersController } from 'src/users/users.controller';
import { User } from 'src/users/entities/users.entity';
import { Friendship } from 'src/users/entities/friendship.entity';
import { ChatService } from 'src/chat/chat.service';
import { Conversation } from 'src/chat/entities/conversation.entity';
import { GameService } from 'src/game/game.service';
import { GameGateway } from './game.gateway';
import { GameController } from 'src/game/game.controller';
import { MatchmakingService } from 'src/game/matchmaking/matchmaking.service';
import { Game } from 'src/game/entities/games.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		TypeOrmModule.forFeature([Friendship]),
		TypeOrmModule.forFeature([Game]),
	],
    controllers: [GameController],
  	providers: [GameGateway, GameService, MatchmakingService],
  	exports: [GameService],
})
export class GameGatewayModule {}