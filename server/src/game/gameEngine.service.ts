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

	) { }


	createGameInstance(game: Game) {

		const paddleOneStart: vector_instance = { x: 0, y: 0.415 };
		const paddleOneEnd: vector_instance = { x: 0, y: 0.585 };

		const paddleTwoStart: vector_instance = { x: 1 - 0.025, y: 0.415 };
		const paddleTwoEnd: vector_instance = { x: 1 - 0.025, y: 0.585 };

		const paddleThreeStart: vector_instance = { x: 0, y: 0 };
		const paddleThreeEnd: vector_instance = { x: 1, y: 0 };

		const paddleFourStart: vector_instance = { x: 0, y: 1 };
		const paddleFourEnd: vector_instance = { x: 1, y: 1 };
		let signe = (Math.random() - 0.5) > 0 ? 1 : -1;
		const newGame: Game_instance = {
			game_has_started: true,
			game_has_ended: false,
			gameID: game.gameId,
			ball: {
				goal: 0,
				position: { x: 0.5, y: 0.5 },
				speed: { x: (signe / 120) * 16 / 9 / 10, y: (Math.random() - 0.5) * Math.random() / 60 },
				r: 0.04,
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
				{ number: 1, x: 0, y: 0.415, speed: 1 / 60, up: false, down: false, end: { x: 0, y: 0.585 }, start: { x: 0, y: 0.415 }, is_a_paddle: true, length: this.VectorService.mag(this.VectorService.sub(paddleOneEnd, paddleOneStart)) },
				{ number: 2, x: 1 - 0.025, y: 0.415, speed: 1 / 60, up: false, down: false, end: { x: 1 - 0.025, y: 0.585 }, start: { x: 1 - 0.025, y: 0.415 }, is_a_paddle: true, length: this.VectorService.mag(this.VectorService.sub(paddleTwoEnd, paddleTwoStart)) },
				{ number: 3, x: 0, y: 0, speed: 0, up: false, down: false, end: { x: 1, y: 0 }, start: { x: 0, y: 0 }, is_a_paddle: false, length: this.VectorService.mag(this.VectorService.sub(paddleThreeEnd, paddleThreeStart)) },
				{ number: 4, x: 0, y: 1, speed: 0, up: false, down: false, end: { x: 1, y: 1 }, start: { x: 0, y: 1 }, is_a_paddle: false, length: this.VectorService.mag(this.VectorService.sub(paddleFourEnd, paddleFourStart)) },
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

	// async createGameEngine(player1ID: string, player2ID: string) {
	// 	const gameEngine = new GameEngine();
	// 	const game: Game = await this.gameRepository.findOne({ where: { playerOneID: player1ID } })
	// 	console.log(`tell me ${game.gameId}`);
	// 	gameEngine.playerOneID = player1ID;
	// 	gameEngine.playerTwoID = player2ID;
	// 	gameEngine.scoreOne = 0;
	// 	gameEngine.scoreTwo = 0;
	// 	gameEngine.gameID = game.gameId;
	// 	await this.gameEngineRepository.save(gameEngine);
	// 	return (gameEngine);
	// }

	// private async createAndSavePaddle(width: number, height: number, x_pos: number, y_pos: number): Promise<Paddle> {
	// 	const paddle = new Paddle();
	// 	paddle.width = width;
	// 	paddle.height = height;
	// 	paddle.x_pos = x_pos;
	// 	paddle.y_pos = y_pos;

	// 	// Enregistrer le paddle dans la base de données
	// 	await this.paddleRepository.save(paddle);

	// 	return paddle;
	// }

	// async savePaddle(paddle: Paddle, width: number, height: number, x_pos: number, y_pos: number): Promise<Paddle> {
	// 	paddle.width = width;
	// 	paddle.height = height;
	// 	paddle.x_pos = x_pos;
	// 	paddle.y_pos = y_pos;

	// 	// Enregistrer le paddle dans la base de données
	// 	await this.paddleRepository.save(paddle);

	// 	return paddle;
	// }

	// async getGameEngine(gameID: number): Promise<GameEngine> {
	// 	const gameEngine: GameEngine = await this.gameEngineRepository.findOne({ where: { gameID: gameID } })
	// 	return (gameEngine);
	// }

	updateGameInstance(gameInstance: Game_instance, server: any) {
		const paddleOneStart: vector_instance = { x: 0, y: 0.415 };
		const paddleOneEnd: vector_instance = { x: 0, y: 0.585 };

		const paddleTwoStart: vector_instance = { x: 1 - 0.025, y: 0.415 };
		const paddleTwoEnd: vector_instance = { x: 1 - 0.025, y: 0.585 };

		const paddleThreeStart: vector_instance = { x: 0, y: 0 };
		const paddleThreeEnd: vector_instance = { x: 1, y: 0 };

		const paddleFourStart: vector_instance = { x: 0, y: 1 };
		const paddleFourEnd: vector_instance = { x: 1, y: 1 };
		let signe = (Math.random() - 0.5) > 0 ? 1 : -1;
		gameInstance.ball = this.updateBall(gameInstance.ball);
		// reset game si l'un des joueurs a marque
		// remettre les paddles au milieu et la ball aussi, maj les scores CHECK
		// puis emit les changements et realiser un timeout de 2-3 secondes avant de relancer la game
		// finir la game si le score pour l'un des deux est a 5
		if (gameInstance.ball.alive === false) {
			if (gameInstance.ball.goal === 1 || gameInstance.ball.goal === 3 ) {
				gameInstance.player1_score += 1;
				if (gameInstance.ball.goal === 3) {
					gameInstance.player1_score -= 1;
				}
				if (gameInstance.player1_score === gameInstance.victory_condition) {
					console.log(`FIN DE LA GAME`);
					gameInstance.game_has_ended = true;
					server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GameEnd')
					//emit au front avec gameInstance pour finir les boucles et afficher le gagnant
				}
				gameInstance.ball.position.x = 0.5;
				gameInstance.ball.position.y = 0.5;
				gameInstance.ball.speed = { x: (signe / 120) * 16 / 9 / 10, y: (Math.random() - 0.5) * Math.random() / 60 };
				gameInstance.paddles = [
					{ number: 1, x: 0, y: 0.415, speed: 1 / 60, up: false, down: false, end: { x: 0, y: 0.585 }, start: { x: 0, y: 0.415 }, is_a_paddle: true, length: this.VectorService.mag(this.VectorService.sub(paddleOneEnd, paddleOneStart)) },
					{ number: 2, x: 1 - 0.025, y: 0.415, speed: 1 / 60, up: false, down: false, end: { x: 1 - 0.025, y: 0.585 }, start: { x: 1 - 0.025, y: 0.415 }, is_a_paddle: true, length: this.VectorService.mag(this.VectorService.sub(paddleTwoEnd, paddleTwoStart)) },
					{ number: 3, x: 0, y: 0, speed: 0, up: false, down: false, end: { x: 1, y: 0 }, start: { x: 0, y: 0 }, is_a_paddle: false, length: this.VectorService.mag(this.VectorService.sub(paddleThreeEnd, paddleThreeStart)) },
					{ number: 4, x: 0, y: 1, speed: 0, up: false, down: false, end: { x: 1, y: 1 }, start: { x: 0, y: 1 }, is_a_paddle: false, length: this.VectorService.mag(this.VectorService.sub(paddleFourEnd, paddleFourStart)) },
				]
				gameInstance.ball.goal = 3;
				server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GameGoal')
				setTimeout(() => {
					gameInstance.ball.goal = 0;
					gameInstance.ball.alive = true;
					// emit to the front end if needed timer and for stop possibility of moove paddle for 3seconds
				}, 3000);
				return;
			}
			else if (gameInstance.ball.goal === 2 || gameInstance.ball.goal === 3) {
				gameInstance.player2_score += 1;
				if (gameInstance.ball.goal === 3) {
					gameInstance.player2_score -= 1;
				}
				if (gameInstance.player2_score === gameInstance.victory_condition) {
					console.log(`FIN DE LA GAME`);
					gameInstance.game_has_ended = true;
					server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GameEnd')
					//emit au front avec gameInstance pour finir les boucles et afficher le gagnant
				}
				gameInstance.ball.position.x = 0.5;
				gameInstance.ball.position.y = 0.5;
				gameInstance.ball.speed = { x: (signe / 120) * 16 / 9 / 10, y: (Math.random() - 0.5) * Math.random() / 60 };
				gameInstance.paddles = [
					{ number: 1, x: 0, y: 0.415, speed: 1 / 60, up: false, down: false, end: { x: 0, y: 0.585 }, start: { x: 0, y: 0.415 }, is_a_paddle: true, length: this.VectorService.mag(this.VectorService.sub(paddleOneEnd, paddleOneStart)) },
					{ number: 2, x: 1 - 0.025, y: 0.415, speed: 1 / 60, up: false, down: false, end: { x: 1 - 0.025, y: 0.585 }, start: { x: 1 - 0.025, y: 0.415 }, is_a_paddle: true, length: this.VectorService.mag(this.VectorService.sub(paddleTwoEnd, paddleTwoStart)) },
					{ number: 3, x: 0, y: 0, speed: 0, up: false, down: false, end: { x: 1, y: 0 }, start: { x: 0, y: 0 }, is_a_paddle: false, length: this.VectorService.mag(this.VectorService.sub(paddleThreeEnd, paddleThreeStart)) },
					{ number: 4, x: 0, y: 1, speed: 0, up: false, down: false, end: { x: 1, y: 1 }, start: { x: 0, y: 1 }, is_a_paddle: false, length: this.VectorService.mag(this.VectorService.sub(paddleFourEnd, paddleFourStart)) },
				]
				gameInstance.ball.goal = 3;
				setTimeout(() => {
					gameInstance.ball.goal = 0;
					gameInstance.ball.alive = true;
					// emit to the front end if needed timer
				}, 3000);
				return;
			}
		}
		let i = 0;
		gameInstance.paddles.forEach((paddle) => {
			console.log(`Paddle ${i}`);
			i++;
			if (this.BallService.collisionWithPaddle(gameInstance.ball, paddle)) { // if collision
				this.BallService.penetration_resolution_bw(gameInstance.ball, paddle); // then do the repositionning
				this.BallService.collision_resolution_bw(gameInstance.ball, paddle); // and the change in speed
			}
		});
	}

	updateBall(ball: ball_instance) {
		return (this.BallService.updateBallPosition(ball));
	}
}
/**
	 * Du coup, reorienter toutes les fonctions et autres avec les nouvelles classes
	 * et garder les entities pour le game history peut etre
	 * Debug le up et down dans le front, mettre en place le gameInput
	 * 
	 * Dabord rieorienter 
	 */