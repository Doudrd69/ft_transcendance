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
		if (paddle.ArrowUp) {
			paddle.start.y -= paddle.speed;
			paddle.end.y -= paddle.speed;
			if (paddle.start.y < 0) {
				paddle.start.y = 0;
				paddle.end.y = paddle.length; 
			}
		}
		else if (paddle.ArrowDown) {
			paddle.start.y += paddle.speed;
			paddle.end.y += paddle.speed;
			if (paddle.end.y > 1) {
				paddle.start.y = 1 - paddle.length;
				paddle.end.y = 1;
			}
		}
	}

	wallUnit(paddle: paddle_instance) {
        return (this.VectorService.normalize(this.VectorService.sub(paddle.end, paddle.start)));
    }

	processInputUp (paddle: paddle_instance, input: string) {
        if (input === "ArrowUp" || input === "w") {
            paddle.ArrowUp = false;
            if (paddle.ArrowUp) {
                paddle.ArrowDown = false;
            }
        }
		if (input === "ArrowDown" || input === "s") {
            paddle.ArrowDown = false;
            if (paddle.ArrowDown) {
                paddle.ArrowUp = false;
            }
        }
    }

	processInputDown (paddle: paddle_instance, input: string) {
        if (input === "ArrowUp" || input === "w") {
            paddle.ArrowUp = true;
            if (paddle.ArrowUp) {
                paddle.ArrowDown = false;
            }
        }
		if (input === "ArrowDown" || input === "s") {
            paddle.ArrowDown = true;
            if (paddle.ArrowDown) {
                paddle.ArrowUp = false;
            }
        }
    }
}