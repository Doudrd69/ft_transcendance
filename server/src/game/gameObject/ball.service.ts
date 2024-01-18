import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Game } from '../entities/games.entity';
import { User } from 'src/users/entities/users.entity';
import { GameEngine } from '../entities/gameEngine.entity';
import { Paddle } from '../entities/paddle.entity';
import { Ball } from '../entities/ball.entity';
import { VectorService } from './vector.service';
import { ball_instance } from 'src/game_gateway/game.gateway';

@Injectable()
export class BallService {
	constructor(
		@InjectRepository(Game)
		private gameRepository: Repository<Game>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(GameEngine)
		private gameEngineRepository: Repository<GameEngine>,
		@InjectRepository(Paddle)
		private paddleRepository: Repository<Paddle>,
		@InjectRepository(Ball)
		private ballRepository: Repository<Ball>,
		private readonly VectorService: VectorService,
	) {}

	// async getSaveBall(ball: Ball, x: number, y: number, speedx: number, speedy: number): Promise<Ball> {
	// 	return (this.saveBall(ball, x, y, speedx, speedy));
	// }

	// async getCreateAndSaveBall(x: number, y: number, speedx: number, speedy: number): Promise<Ball> {
	// 	return (this.createAndSaveBall(x, y, speedx, speedy));
	// }

	updateBallPosition(ball: ball_instance) {
        ball.position = this.VectorService.add(ball.position, ball.speed);
		// if (ball.position.x - ball.r < 0) {
			// ball.alive = false;
		// }
		// else if (ball.position.x + ball.r > ball.aspect_ratio) {
            // ball.alive = false;
		return (ball);
    }

	// private async createAndSaveBall(x: number, y: number, speedx: number, speedy: number) {


    //     ball.position = await this.VectorService.getCreateAndSaveVector(x, y)
	// 	ball.speed = await this.VectorService.getCreateAndSaveVector(speedx, speedy);
        
	// 	await this.ballRepository.save(ball);

    //     return ball;
    // }

	// private async saveBall(ball: Ball, x: number, y: number, speedx: number, speedy: number) {
	// 	ball.position = await this.VectorService.getCreateAndSaveVector(x, y)
	// 	ball.speed = await this.VectorService.getCreateAndSaveVector(speedx, speedy);

    //     await this.ballRepository.save(ball);

    //     return ball;
    // }

}