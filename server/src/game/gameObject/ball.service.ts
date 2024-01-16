import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Game } from '../entities/games.entity';
import { User } from 'src/users/entities/users.entity';
import { GameEngine } from '../entities/gameEngine.entity';
import { Paddle } from '../entities/paddle.entity';
import { Ball } from '../entities/ball.entity';
import { VectorService } from './vector.service';
import { ball_instance, paddle_instance } from 'src/game_gateway/game.gateway';
import { PaddleService } from './paddle.service';

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
		private readonly PaddleService: PaddleService,
	) {}

	// async getSaveBall(ball: Ball, x: number, y: number, speedx: number, speedy: number): Promise<Ball> {
	// 	return (this.saveBall(ball, x, y, speedx, speedy));
	// }

	// async getCreateAndSaveBall(x: number, y: number, speedx: number, speedy: number): Promise<Ball> {
	// 	return (this.createAndSaveBall(x, y, speedx, speedy));
	// }

	updateBallPosition(ball: ball_instance) {
        ball.position = this.VectorService.add(ball.position, ball.speed);
		if (ball.position.x - ball.r < 0) {
			ball.alive = false;
		}
		else if (ball.position.x + ball.r > 16/9) {
            ball.alive = false;
		}
		return (ball);
    }

	collisionWithPaddle(ball: ball_instance, paddle: paddle_instance) {
		let closest_dist_vec = this.VectorService.sub(this.closestPointWithPaddle(ball, paddle), ball.position);
        if (this.VectorService.mag(closest_dist_vec) <= ball.r) {
            return true;
        }
        return false;
	}

	closestPointWithPaddle(ball: ball_instance, paddle: paddle_instance) {
		let ball_to_wall_start = this.VectorService.sub(paddle.start, ball.position);
        if (this.VectorService.dot(this.PaddleService.wallUnit(paddle), ball_to_wall_start) > 0)
            return (paddle.start);

        let ball_to_wall_end = this.VectorService.sub(paddle.end, ball.position);
        if (this.VectorService.dot(this.PaddleService.wallUnit(paddle), ball_to_wall_end) < 0)
            return (paddle.end);

        let closest_dist = this.VectorService.dot(this.PaddleService.wallUnit(paddle), ball_to_wall_start);
        let closest_vec = this.VectorService.scale(closest_dist, this.PaddleService.wallUnit(paddle));
        return (this.VectorService.sub(paddle.start, closest_vec));
	}

	penetration_resolution_bw(ball: ball_instance, paddle: paddle_instance) {
		let closest_point = this.closestPointWithPaddle(ball, paddle);
        let resolution_vec = this.VectorService.sub(ball.position, closest_point);
        let resolution_vec_normal = this.VectorService.normalize(resolution_vec);
        let resolution_magnitude = ball.r - this.VectorService.mag(resolution_vec);
        ball.position = this.VectorService.add(ball.position, this.VectorService.scale(resolution_magnitude, resolution_vec_normal ));
	}

	collision_resolution_bw(ball: ball_instance, paddle: paddle_instance) {
		let normal = this.VectorService.normalize(this.VectorService.sub(ball.position, this.closestPointWithPaddle(ball, paddle)));
        let normal_velocity = this.VectorService.dot(normal, ball.speed);
        let new_separation_velocity = -normal_velocity * ball.elasticity;
        ball.speed = this.VectorService.add(ball.speed, this.VectorService.scale(-normal_velocity + new_separation_velocity, normal));
        if (paddle.is_a_paddle) {
            let ratio = (ball.position.y - (paddle.y + paddle.length/2))/(paddle.length/2);
            if (ratio >=0) {
                ball.speed.y = Math.min(ratio * 1/60, 1/60);
            }
            else {
                ball.speed.y = Math.max(ratio * 1/60, -1/60);
            }
        }
	}



	//peut etre donner le score et le changer ici ?

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