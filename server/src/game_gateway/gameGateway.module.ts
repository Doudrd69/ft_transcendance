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
import { GameEngine } from 'src/game/entities/gameEngine.entity';
import { GameEngineService } from 'src/game/gameEngine.service';
import { Paddle } from 'src/game/entities/paddle.entity';
import { PaddleService } from 'src/game/gameObject/paddle.service';
import { Ball } from 'src/game/entities/ball.entity';
import { BallService } from 'src/game/gameObject/ball.service';
import { VectorService } from 'src/game/gameObject/vector.service';
import { Vector } from 'src/game/entities/vector.entity';


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
	  providers: [
		GameGateway,
		GameService,
		MatchmakingService,
		GameEngineService,
		PaddleService,
		BallService,
		VectorService,
	  ],
	  exports: [GameService],
	})
	export class GameGatewayModule {}