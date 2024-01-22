import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Game } from '../entities/games.entity';
import { User } from 'src/users/entities/users.entity';
import { Paddle } from '../entities/paddle.entity';
import { paddle_instance } from 'src/game_gateway/game.gateway';
import { VectorService } from './vector.service';

@Injectable()
export class PaddleService {
	constructor(
		@InjectRepository(Game)
		private gameRepository: Repository<Game>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Paddle)
		private paddleRepository: Repository<Paddle>,
		private readonly VectorService: VectorService,


	) {}

	async updatePaddlePosition(paddle: paddle_instance) {
		if (paddle.up) {
			paddle.y -= paddle.speed;
			if (paddle.y < 0)
				paddle.y = 0;
		}
		else if (paddle.down) {
			paddle.y -= (paddle.speed * -1);
			if (paddle.y > 1 - paddle.length)
				paddle.y = 1 - paddle.length;
		}
	}

	wallUnit(paddle: paddle_instance) {
        return (this.VectorService.normalize(this.VectorService.sub(paddle.end, paddle.start)));
    }

	process_input (paddle: paddle_instance, input: string) {
        if (input === "ArrowUp" || input === "w") {
            paddle.up = !paddle.up;
            if (paddle.up) {
                paddle.down = false;
            }
        }
		if (input === "ArrowDown" || input === "s") {
            paddle.down = !paddle.down;
            if (paddle.down) {
                paddle.up = false;
            }
        }
    }
}