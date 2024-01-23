import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from "src/users/entities/users.entity";
import { Game } from "./entities/games.entity";
import { Paddle } from './entities/paddle.entity';
import { PaddleService } from './gameObject/paddle.service';
import { Ball } from './entities/ball.entity';
import { BallService } from './gameObject/ball.service';
import { VectorService } from './gameObject/vector.service';
import { Vector } from './entities/vector.entity';
import { Game_instance, ball_instance, vector_instance } from 'src/game_gateway/game.gateway';
import { GameService } from './game.service';
// import { serverHooks } from 'next/dist/server/app-render/entry-base';

@Injectable()
export class GameEngineService {
	constructor(
		@InjectRepository(Game)
		private gameRepository: Repository<Game>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Paddle)
		private paddleRepository: Repository<Paddle>,
		@InjectRepository(Ball)
		private ballRepository: Repository<Ball>,
		@InjectRepository(Vector)
		private vectorRepository: Repository<Vector>,
		private readonly BallService: BallService,
		private readonly VectorService: VectorService,
		private readonly PaddleService: PaddleService,
		private readonly GameService: GameService,

	) { }


	createGameInstance(game: Game) {
		let signe = (Math.random() - 0.5) > 0 ? 1 : -1;
		const newGame: Game_instance = {
			game_has_started: true,
			game_has_ended: false,
			gameID: game.gameId,
			ball: {
				goal: 0,
				position: { x: 0.5, y: 0.5 },
				speed: { x: (signe / 120) * 16 / 9 /10, y: (Math.random() - 0.5) * Math.random() / 60 },
				r: 0.02,
				alive: true,
				elasticity: 1.02,
			},
			player1_score: 0,
			player2_score: 0,
			players: [game.playerOneID, game.playerTwoID],
			playersLogin: [game.playerOneLogin, game.playerTwoLogin],
			super_game_mode: false,
			victory_condition: 5,
			paddles: [
				{ number: 1, x: 0.025, y: 0.415, speed: 1 / 60, up: false, down: false, end: { x: 0.025, y: 0.585 }, start: { x: 0.025, y: 0.415 }, is_a_paddle: true, length: 0.17 },
				{ number: 2, x: 1 - 0.025, y: 0.415, speed: 1 / 60, up: false, down: false, end: { x: 1 - 0.025, y: 0.585 }, start: { x: 1 - 0.025, y: 0.415 }, is_a_paddle: true, length: 0.17 },
				// { number: 3, x: 0, y: 0, speed: 0, up: false, down: false, end: { x: 1, y: 0 }, start: { x: 0, y: 0 }, is_a_paddle: false, length: 1 },
				// { number: 4, x: 0, y: 1, speed: 0, up: false, down: false, end: { x: 1, y: 1 }, start: { x: 0, y: 1 }, is_a_paddle: false, length: 1 },
			],
		}
		return newGame;
	}

	async game_input(input: string, gameInstance: Game_instance, playerID: string) {
		if (playerID === gameInstance.players[0]) {
			this.PaddleService.process_input(gameInstance.paddles[0], input);
			this.paddleLeftInput(input, gameInstance);
		}
		else if (playerID === gameInstance.players[1]) {
			this.PaddleService.process_input(gameInstance.paddles[1], input);
			this.paddleRightInput(input, gameInstance);
		}
		else
			console.log("No Player find in GameEngine for this Input");
	}

	async paddleLeftInput(input: string, gameInstance: Game_instance) {
		if (input === "ArrowUp") {
			this.paddleLeftUp(gameInstance);
		}
		else if (input === "ArrowDown") {
			this.paddleLeftDown(gameInstance);
		}
		else
			console.log("Wrong PaddleLeftInput try something like ArrowUp or ArrowDown")
	}

	async paddleRightInput(input: string, gameInstance: Game_instance) {
		if (input === "ArrowUp") {
			this.paddleRightUp(gameInstance);
		}
		else if (input === "ArrowDown") {
			this.paddleRightDown(gameInstance);
		}
		else
			console.log("Wrong PaddleRightInput try something like ArrowUp or ArrowDown")
	}

	async paddleRightUp(gameInstance: Game_instance) {
		this.PaddleService.updatePaddlePosition(gameInstance.paddles[1]);
	}

	async paddleRightDown(gameInstance: Game_instance) {
		this.PaddleService.updatePaddlePosition(gameInstance.paddles[1]);
	}

	async paddleLeftDown(gameInstance: Game_instance) {
		this.PaddleService.updatePaddlePosition(gameInstance.paddles[0]);
	}

	async paddleLeftUp(gameInstance: Game_instance) {
		this.PaddleService.updatePaddlePosition(gameInstance.paddles[0]);
	}

	updateGameInstance(gameInstance: Game_instance, server: any) {
		// if (gameInstance.ball.alive === false) {
		// 	let signe = (Math.random() - 0.5) > 0 ? 1 : -1;
		// 	if (gameInstance.ball.goal === 1 || gameInstance.ball.goal === 3) {
		// 		gameInstance.player1_score += 1;
		// 		if (gameInstance.ball.goal === 1) {
		// 			console.log(`goal ball position x: ${gameInstance.ball.position.x}`)
		// 			console.log(`goal ball position y: ${gameInstance.ball.position.y}`)
		// 			console.log(`goal paddle position x: ${gameInstance.paddles[0].x}`)
		// 			console.log(`goal paddle position y: ${gameInstance.paddles[0].y}`)
		// 			console.log(`goal paddle length: ${gameInstance.paddles[0].length}`)
		// 		}
		// 		if (gameInstance.ball.goal === 3) {
		// 			gameInstance.player1_score -= 1;
		// 		}
		// 		if (gameInstance.player1_score === gameInstance.victory_condition) {
		// 			gameInstance.game_has_ended = true;
		// 			server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GameEnd')
		// 			return;
		// 		}
		// 		gameInstance.ball.position.x = 0.5;
		// 		gameInstance.ball.position.y = 0.5;
		// 		gameInstance.ball.speed = { x: (signe / 120) * 0.177, y: (Math.random() - 0.5) * Math.random() / 60 };
		// 		gameInstance.paddles = [
		// 			{ number: 1, x: 0.025, y: 0.415, speed: 1 / 60, up: false, down: false, end: { x: 0.025, y: 0.585 }, start: { x: 0.025, y: 0.415 }, is_a_paddle: true, length: 0.17 },
		// 			{ number: 2, x: 1 - 0.025, y: 0.415, speed: 1 / 60, up: false, down: false, end: { x: 1 - 0.025, y: 0.585 }, start: { x: 1 - 0.025, y: 0.415 }, is_a_paddle: true, length: 0.17 },
		// 			{ number: 3, x: 0, y: 0, speed: 0, up: false, down: false, end: { x: 1, y: 0 }, start: { x: 0, y: 0 }, is_a_paddle: false, length: 1 },
		// 			{ number: 4, x: 0, y: 1, speed: 0, up: false, down: false, end: { x: 1, y: 1 }, start: { x: 0, y: 1 }, is_a_paddle: false, length: 1 },
		// 		]
		// 		gameInstance.ball.goal = 3;
		// 		server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GameGoal', {
		// 			BallPosition: { x: gameInstance.ball.position.x, y: gameInstance.ball.position.y },
		// 			scoreOne: gameInstance.player1_score,
		// 			scoreTwo: gameInstance.player2_score,
		// 			paddleOne: { x: gameInstance.paddles[0].x - 0.025, y: gameInstance.paddles[0].y },
		// 			paddleTwo: { x: gameInstance.paddles[1].x, y: gameInstance.paddles[1].y },
		// 		})
		// 		setTimeout(() => {
		// 			gameInstance.ball.goal = 0;
		// 			gameInstance.ball.alive = true;
		// 		}, 3000);
		// 		return;
		// 	}
		// 	else if (gameInstance.ball.goal === 2 || gameInstance.ball.goal === 3) {
		// 		gameInstance.player2_score += 1;
		// 		if (gameInstance.ball.goal === 2) {
		// 			console.log(`goal ball position x: ${gameInstance.ball.position.x}`)
		// 			console.log(`goal ball position y: ${gameInstance.ball.position.y}`)
		// 			console.log(`goal paddle position x: ${gameInstance.paddles[1].x}`)
		// 			console.log(`goal paddle position y: ${gameInstance.paddles[1].y}`)
		// 		}
		// 		if (gameInstance.ball.goal === 3) {
		// 			gameInstance.player2_score -= 1;
		// 		}
		// 		if (gameInstance.player2_score === gameInstance.victory_condition) {
		// 			gameInstance.game_has_ended = true;
		// 			server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GameEnd')
		// 			return;
		// 		}
		// 		gameInstance.ball.position.x = 0.5;
		// 		gameInstance.ball.position.y = 0.5;
		// 		gameInstance.ball.speed = { x: (signe / 120) * 0.177, y: (Math.random() - 0.5) * Math.random() / 60 };
		// 		gameInstance.paddles = [
		// 			{ number: 1, x: 0.025, y: 0.415, speed: 1 / 60, up: false, down: false, end: { x: 0.025, y: 0.585 }, start: { x: 0.025, y: 0.415 }, is_a_paddle: true, length: 0.17 },
		// 			{ number: 2, x: 1 - 0.025, y: 0.415, speed: 1 / 60, up: false, down: false, end: { x: 1 - 0.025, y: 0.585 }, start: { x: 1 - 0.025, y: 0.415 }, is_a_paddle: true, length: 0.17 },
		// 			{ number: 3, x: 0, y: 0, speed: 0, up: false, down: false, end: { x: 1, y: 0 }, start: { x: 0, y: 0 }, is_a_paddle: false, length: 1 },
		// 			{ number: 4, x: 0, y: 1, speed: 0, up: false, down: false, end: { x: 1, y: 1 }, start: { x: 0, y: 1 }, is_a_paddle: false, length: 1 },
		// 		]
		// 		gameInstance.ball.goal = 3;
		// 		server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GameGoal', {
		// 			BallPosition: { x: gameInstance.ball.position.x, y: gameInstance.ball.position.y },
		// 			scoreOne: gameInstance.player1_score,
		// 			scoreTwo: gameInstance.player2_score,
		// 			paddleOne: { x: gameInstance.paddles[0].x - 0.025, y: gameInstance.paddles[0].y },
		// 			paddleTwo: { x: gameInstance.paddles[1].x, y: gameInstance.paddles[1].y },
		// 		})
		// 		setTimeout(() => {
		// 			gameInstance.ball.goal = 0;
		// 			gameInstance.ball.alive = true;
		// 		}, 3000);
		// 		return;
		// 	}
		// }
		let i = 0;
		gameInstance.paddles.forEach((paddle) => {
			// console.log(`Paddle ${i}`);
			i++;
			console.log(paddle.y, )
			if (this.BallService.collisionWithPaddle(gameInstance.ball, paddle)) {
				console.log("BALL COLLIDE WITH PADDLE")
				// this.BallService.penetration_resolution_bw(gameInstance.ball, paddle); // then do the repositionning
				this.BallService.collision_resolution_bw(gameInstance.ball, paddle); // and the change in speed
			}
		});
		gameInstance.ball = this.updateBall(gameInstance.ball);
	}

	updateBall(ball: ball_instance) {
		return (this.BallService.updateBallPosition(ball));
	}
}
