import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from "src/users/entities/users.entity";
import { Game } from "./entities/games.entity";
import { GameEngine } from "./entities/gameEngine.entity";
import { Paddle } from './entities/paddle.entity';
import { PaddleService } from './gameObject/paddle.service';
import { Ball } from './entities/ball.entity';
import { BallService } from './gameObject/ball.service';
import { VectorService } from './gameObject/vector.service';
import { Vector } from './entities/vector.entity';
import { Game_instance, ball_instance } from 'src/game_gateway/game.gateway';

@Injectable()
export class GameEngineService {
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
		@InjectRepository(Vector)
		private vectorRepository: Repository<Vector>,
		private readonly BallService: BallService,
		private readonly VectorService: VectorService,
		private readonly PaddleService: PaddleService,

	) { }


	createGameInstance(game: Game) {
		const newGame: Game_instance = {
			game_has_started : true,
			game_has_ended : false,
			gameID : game.gameId,
			ball : { 	
						position: {x: 153, y: 50},
						speed: {x: 0, y: 0},
						r: 1,
			},
			player1_score : 0,
			player2_score : 0,
			players : [game.playerOneID, game.playerTwoID],
			playersLogin : [game.playerOneLogin, game.playerTwoLogin],
			super_game_mode : false,
			victory_condition : 5,
			paddles : [
				{x: 0, y: 50, speed: 55 / 60, up: false, down: false},
				{x: 306, y: 50, speed: 55 / 60, up: false, down: false},
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

	async createGameEngine(player1ID: string, player2ID: string) {
		const gameEngine = new GameEngine();
		const game: Game = await this.gameRepository.findOne({ where: { playerOneID: player1ID } })
		console.log(`tell me ${game.gameId}`);
		gameEngine.playerOneID = player1ID;
		gameEngine.playerTwoID = player2ID;
		gameEngine.scoreOne = 0;
		gameEngine.scoreTwo = 0;
		gameEngine.gameID = game.gameId;
		await this.gameEngineRepository.save(gameEngine);
		return (gameEngine);
	}

	private async createAndSavePaddle(width: number, height: number, x_pos: number, y_pos: number): Promise<Paddle> {
		const paddle = new Paddle();
		paddle.width = width;
		paddle.height = height;
		paddle.x_pos = x_pos;
		paddle.y_pos = y_pos;

		// Enregistrer le paddle dans la base de données
		await this.paddleRepository.save(paddle);

		return paddle;
	}

	async savePaddle(paddle: Paddle, width: number, height: number, x_pos: number, y_pos: number): Promise<Paddle> {
		paddle.width = width;
		paddle.height = height;
		paddle.x_pos = x_pos;
		paddle.y_pos = y_pos;

		// Enregistrer le paddle dans la base de données
		await this.paddleRepository.save(paddle);

		return paddle;
	}

	async getGameEngine(gameID: number): Promise<GameEngine> {
		const gameEngine: GameEngine = await this.gameEngineRepository.findOne({ where: { gameID: gameID } })
		return (gameEngine);
	}

	updateGameEngine(gameInstance: Game_instance) {
		gameInstance.ball = this.updateBall(gameInstance.ball);
		// console.log(`Ball Position: ${gameEngine.ball.position.x}`);
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