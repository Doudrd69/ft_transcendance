import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/users.entity';
import { Friendship } from 'src/users/entities/friendship.entity';
import { GameService } from 'src/game/game.service';
import { GameController } from 'src/game/game.controller';
import { MatchmakingService } from 'src/game/matchmaking/matchmaking.service';
import { Game } from 'src/game/entities/games.entity';
import { GameEngineService } from 'src/game/gameEngine.service';
import { Paddle } from 'src/game/entities/paddle.entity';
import { PaddleService } from 'src/game/gameObject/paddle.service';
import { Ball } from 'src/game/entities/ball.entity';
import { BallService } from 'src/game/gameObject/ball.service';
import { VectorService } from 'src/game/gameObject/vector.service';
import { Vector } from 'src/game/entities/vector.entity';
import { GameGateway } from './game.gateway';
import {APP_FILTER} from "@nestjs/core";
import {AllExceptionsFilter} from "./game-exception.filter";


@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		TypeOrmModule.forFeature([Friendship]),
		TypeOrmModule.forFeature([Game]),
		TypeOrmModule.forFeature([Paddle]),
		TypeOrmModule.forFeature([Ball]),
		TypeOrmModule.forFeature([Vector]),
	  ],
	  controllers: [GameController],
	  providers: [
		  {provide: APP_FILTER, useClass: AllExceptionsFilter},
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
