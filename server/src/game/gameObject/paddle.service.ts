import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Game } from '../entities/games.entity';
import { User } from 'src/users/entities/users.entity';
import { GameEngine } from '../entities/gameEngine.entity';
import { Paddle } from '../entities/paddle.entity';

@Injectable()
export class PaddleService {
	constructor(
		@InjectRepository(Game)
		private gameRepository: Repository<Game>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(GameEngine)
		private gameEngineRepository: Repository<GameEngine>,
		@InjectRepository(Paddle)
		private paddleRepository: Repository<Paddle>,


	) { }

	async up(paddle: Paddle) {
		paddle.y_pos -= paddle.speed;
		if (paddle.y_pos < 0)
		paddle.y_pos = 0;
	}

	async down(paddle: Paddle) {
		paddle.y_pos -= (paddle.speed * -1);
		if (paddle.y_pos > 82)
		paddle.y_pos = 82;
	}
}