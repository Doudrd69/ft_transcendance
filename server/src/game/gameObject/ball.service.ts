import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Game } from '../entities/games.entity';
import { User } from 'src/users/entities/users.entity';
import { Paddle } from '../entities/paddle.entity';
import { Ball } from '../entities/ball.entity';
import { VectorService } from './vector.service';
import { ball_instance, paddle_instance } from 'src/game_gateway/game.gateway';
import { PaddleService } from './paddle.service';
import { truncate } from 'fs';

@Injectable()
export class BallService {
	constructor(
		@InjectRepository(Game)
		private gameRepository: Repository<Game>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Paddle)
		private paddleRepository: Repository<Paddle>,
		@InjectRepository(Ball)
		private ballRepository: Repository<Ball>,
		private readonly VectorService: VectorService,
		private readonly PaddleService: PaddleService,
	) { }

	updateBallPosition(ball: ball_instance) {
		ball.position = this.VectorService.add(ball.position, ball.speed);
		if (ball.position.x + ball.r <= 0) {
			ball.alive = false;
			ball.player1Scored = true;
		}
		else if (ball.position.x + ball.r >= 1) {
			ball.alive = false;
			ball.player2Scored = true;
		}
		if (ball.position.y - ball.r < 0) {
			ball.speed.y *= -1
		}
		else if (ball.position.y + ball.r > 1) {
			ball.speed.y *= -1
		}
		return (ball);
	}
	// refaire un check de collision? em mode
	collisionWithPaddle(ball: ball_instance, paddle: paddle_instance) {
		let distanceBetweenBallAndPaddle = this.VectorService.norm(this.VectorService.sub(this.closestPointWithPaddle(ball, paddle), ball.position));

		// setTimeout(() => {
		// 	if (paddle.number === 1 && ball.position.x) {
		// 		// console.log(`paddle{${paddle.number}}, distance: ${distanceBetweenBallAndPaddle}, x: ${paddle.start.x}, y: ${paddle.start.y}`);
		// 	}
		// }, 100);
		return (distanceBetweenBallAndPaddle <= ball.r)
	}

	// checkCollisionPaddle(ball: ball_instance, paddle: paddle_instance) {
	// 	if (ball.position.x <= 0.2)
	// 		return (this.checkPaddleOne(ball, paddle));
	// 	else if (ball.position.x >= 0.8)
	// 		return (this.checkPaddleTwo(ball, paddle));
	// 	return false;
	// }

	// checkPaddleOne(ball: ball_instance, paddle: paddle_instance) {
	// 	if (ball.position.x - ball.r <= 0.025 && ball.position.y >= paddle.y && ball.position.y <= paddle.y + paddle.length)
	// 		return true;
	// 	return false;
	// }

	// checkPaddleTwo(ball: ball_instance, paddle: paddle_instance) {
	// 	if (ball.position.x + ball.r >= 0.975 && ball.position.y >= paddle.y && ball.position.y <= paddle.y + paddle.length)
	// 		return true;
	// 	return false;
	// }

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
		let resolution_normnitude = ball.r - this.VectorService.norm(resolution_vec);
		ball.position = this.VectorService.add(ball.position, this.VectorService.scale(resolution_normnitude, resolution_vec_normal));
	}
 
	collision_resolution_bw(ball: ball_instance, paddle: paddle_instance) {
		let normal = this.VectorService.normalize(this.VectorService.sub(ball.position, this.closestPointWithPaddle(ball, paddle)));
		let normal_velocity = this.VectorService.dot(normal, ball.speed);
		let new_separation_velocity = -normal_velocity * ball.elasticity;
		ball.speed = this.VectorService.add(ball.speed, this.VectorService.scale(-normal_velocity + new_separation_velocity, normal));
		// if (paddle.is_a_paddle) {
			// let ratio = (ball.position.y - (paddle.start.y + paddle.length / 2)) / (paddle.length / 2);
			// if (ratio >= 0) {
			// 	ball.speed.y = Math.min(ratio * 1 / 60, 1 / 60);
			// }
			// else {
			// 	ball.speed.y = Math.max(ratio * 1 / 60, -1 / 60);
			// }
		// }
	}
	// collision non fonctionnel, paddle gauche ne prend pas en compte, regarder les autres pour le ratio,
	// Collision Bas, descend a rayon/2 trop bas,
	// Collision haut, s'arrete a rayon complet trop bas,
	// Collision paddle Gauche player 1, pas fonctionnel check si Collision interprete puis la suite des calculs
	// Collision paddle Droit player 2, a priori fonctionnel mais j'ai l'impression pas au bonne endroit.

	// Pour le reset de parties, ne pas pouvoir changer pos paddle pendant la pause, de meme pendant le blurgame.
	// check l'incrementation de point, et stop tout avec un emit socket pour changer de pages les player.

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