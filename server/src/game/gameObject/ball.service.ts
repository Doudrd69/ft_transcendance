import { InjectRepository } from '@nestjs/typeorm';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Game } from '../entities/games.entity';
import { User } from 'src/users/entities/users.entity';
import { Paddle } from '../entities/paddle.entity';
import { Ball } from '../entities/ball.entity';
import { VectorService } from './vector.service';
import { ball_instance, paddle_instance, vector_instance } from 'src/game_gateway/game.gateway';
import { PaddleService } from './paddle.service';

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
			ball.player2Scored = true;
		}
		else if (ball.position.x + ball.r >= 1) {
			ball.alive = false;
			ball.player1Scored = true;
		}
		if (ball.position.y - ball.r < 0) {
			ball.position.y = ball.r;
			ball.speed.y *= -1
		}
		else if (ball.position.y + ball.r > 1) {
			ball.position.y = 1 - ball.r;
			ball.speed.y *= -1
		}
		return (ball);
	}

	collisionWithPaddle(ball: ball_instance, paddle: paddle_instance) {
		const newBall: ball_instance = this.nextPositionBall(ball, paddle);
		if (this.ballBehindPaddle(newBall, paddle) && this.ballIntersectWithPaddle(ball, paddle)) {
			// this.ballIntersectWithPaddle(ball, paddle);
			return true;
		}
		return (false)
	}

	ballIntersectWithPaddle(ball: ball_instance, paddle: paddle_instance) {
		let normalizedBallTrajectory = this.VectorService.normalize(ball.speed);
		normalizedBallTrajectory.x *= 0.02;
		normalizedBallTrajectory.y *= 0.02;
		// calcul les deux point de la ball
		// calcul des deux vecteurs des deux points de la ball
		const firstTrajectoryPoint = this.computeFirstTrajectoryPoint(normalizedBallTrajectory);
		const secondTrajectoryPoint = { x: -firstTrajectoryPoint.x, y: -firstTrajectoryPoint.y };
		const firstPoint = this.VectorService.add(ball.position, firstTrajectoryPoint);
		const normalizedSpeed = { x: ball.r / this.VectorService.norm(ball.speed) * ball.speed.x, y: (ball.r / this.VectorService.norm(ball.speed) * ball.speed.y )};
		const nextFirstPoint = this.VectorService.add(firstPoint, normalizedSpeed);
		const secondPoint = this.VectorService.add(ball.position, secondTrajectoryPoint);
		const nextSecondPoint = this.VectorService.add(secondPoint, normalizedSpeed);
		// calcul des droites de first et second
		// equation des intersections avec chacun des segments
		// console.log(`firstPoint: ${firstPoint.x}, ${firstPoint.y}`)
		// console.log(`ballPos: ${ball.position.x}, ${ball.position.y}`)
		// console.log(`nextFirstPoint: ${nextFirstPoint.x}, ${nextFirstPoint.y}`)
		// console.log(`normalizedSpeed: ${normalizedSpeed.x}, ${normalizedSpeed.y}`)
		if (this.findSegmentIntersection( paddle.start,  paddle.end , firstPoint, nextSecondPoint)) {
			// console.log(`COLLIDE`); 
			return true;
		}
		if (this.findSegmentIntersection( paddle.start,  paddle.end , secondPoint, nextFirstPoint)) {
			// console.log(`COLLIDE`);
			return true;
		}
		return false;
	}

	findSegmentIntersection(point1: vector_instance, point2: vector_instance, point3: vector_instance, point4: vector_instance): vector_instance | null {
		const x1 = point1.x;
		const y1 = point1.y;
		const x2 = point2.x;
		const y2 = point2.y;
	
		const x3 = point3.x;
		const y3 = point3.y;
		const x4 = point4.x;
		const y4 = point4.y;
	
		const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
	
		if (denominator === 0) {
			// Les segments sont parallèles ou colinéaires, pas d'intersection
			return null;
		}
	
		const intersectionX =
			((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denominator;
		const intersectionY =
			((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denominator;
		// console.log(`intersectionX: ${intersectionX}`)
		// console.log(`intersectionY: ${intersectionY}`)
		// console.log(`this.isBetween(intersectionX, x1, x2: ${this.isBetween(intersectionX, x1, x2)}`)
		// console.log(`this.isBetween(intersectionY, y1, y2: ${this.isBetween(intersectionY, y1, y2)}`)
		// console.log(`this.isBetween(intersectionX, x3, x4: ${this.isBetween(intersectionX, x3, x4)}`)
		// console.log(`this.isBetween(intersectionY, y3, y4: ${this.isBetween(intersectionY, y3, y4)}`)			
		// Vérifier si le point d'intersection se trouve sur les deux segments
		if (
			this.isBetween(parseFloat(intersectionX.toFixed(3)), parseFloat(x1.toFixed(3)), parseFloat(x2.toFixed(3))) &&
			this.isBetween(parseFloat(intersectionY.toFixed(3)), parseFloat(y1.toFixed(3)), parseFloat(y2.toFixed(3))) &&
			this.isBetween(parseFloat(intersectionX.toFixed(3)), parseFloat(x3.toFixed(3)), parseFloat(x4.toFixed(3))) &&
			this.isBetween(parseFloat(intersectionY.toFixed(3)), parseFloat(y3.toFixed(3)), parseFloat(y4.toFixed(3)))
		) {
			return { x: intersectionX, y: intersectionY };
		}
	
		// Le point d'intersection n'est pas sur les deux segments
		return null;
	}
	
	isBetween(value: number, start: number, end: number): boolean {
		return value >= Math.min(start, end) && value <= Math.max(start, end);
	}

	computeFirstTrajectoryPoint(normalizedBallTrajectory: vector_instance): vector_instance {
		let theta = 45.0 * Math.PI / 180.0
		let cos_theta = Math.cos(theta)
		let sin_theta = Math.sin(theta)
		let x_prime = normalizedBallTrajectory.x * cos_theta - normalizedBallTrajectory.y * sin_theta
		let y_prime = normalizedBallTrajectory.x * sin_theta + normalizedBallTrajectory.y * cos_theta
		return ({ x: x_prime, y: y_prime })
	}

	nextPositionBall(ball: ball_instance, paddle: paddle_instance) {
		const newBall: ball_instance = { ...ball };
		newBall.position = this.VectorService.add(newBall.position, ball.speed)
		return (newBall);
	}

	ballBehindPaddle(newBall: ball_instance, paddle: paddle_instance) {
		// how check behind or not? si y est entre paddle starty et endy + ball.r
		// puis pour le x check si il est > 0.975 - ball.r ou pour lautre paddle < 0.25 + ball.r
		if ((paddle.number == 1 && newBall.position.x - newBall.r <= paddle.start.x) || (paddle.number == 2 && newBall.position.x + newBall.r >= paddle.start.x)) {
			// console.log(`BEHIND:`);
			return (true);
		}
		return (false);
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
		let resolution_normnitude = ball.r - this.VectorService.norm(resolution_vec);
		ball.position = this.VectorService.add(ball.position, this.VectorService.scale(resolution_normnitude, resolution_vec_normal));
	}

	collision_resolution_bw(ball: ball_instance, paddle: paddle_instance) {
		let normal = this.VectorService.normalize(this.VectorService.sub(ball.position, this.closestPointWithPaddle(ball, paddle)));
		let normal_velocity = this.VectorService.dot(normal, ball.speed);
		let new_separation_velocity = -normal_velocity * ball.elasticity;
		const	scaledVelocity = this.VectorService.scale(-normal_velocity + new_separation_velocity, normal);
		ball.speed = (this.VectorService.add(ball.speed, { x: scaledVelocity.x, y: 0}));
		if (paddle.is_a_paddle) {
			let ratio = (ball.position.y - (paddle.start.y + paddle.length / 2)) / (paddle.length / 2) / 2;
			if (ratio >= 0) {
				ball.speed.y = Math.min(ratio * 1 / 60, 1 / 60);
			}
			else {
				ball.speed.y = Math.max(ratio * 1 / 60, -1 / 60);
			}
		}
		if (ball.speed.x > 0.04)
			ball.speed.x = 0.04;
		if (ball.speed.x < -0.04)
			ball.speed.x = -0.04;
	}
}