import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from "src/users/entities/users.entity";
import { Game } from "./entities/games.entity";
import { GameEngine } from "./entities/gameEngine.entity";
import { Paddle } from './entities/paddle.entity';
import { PaddleService } from './gameObject/paddle.service';
import { Ball } from './entities/ball.entity';
import { VectorService } from './gameObject/vector.service';
import { BallService } from './gameObject/ball.service';
import { Vector } from './entities/vector.entity';

interface BallPosition {
	x: number,
	y: number,
	r: number,
}

interface GameState {
	BallPosition: BallPosition[],
	paddleOne: { x: number, y: number },
	paddleTwo: { x: number, y: number },
}

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
		private readonly PaddleService: PaddleService,
		private readonly BallService: BallService,
		private readonly VectorService: VectorService,

	) {}

	async game_input(input: string, gameEngine: GameEngine, playerID: string) {
		if (playerID === gameEngine.playerOneID) {
			this.paddleLeftInput(input, gameEngine);
		}
		else if (playerID === gameEngine.playerTwoID) {
			this.paddleRightInput(input, gameEngine);
		}
		else
			console.log("No Player find in GameEngine for this Input");
	}

	async paddleLeftInput(input: string, gameEngine: GameEngine) {
		if (input === "ArrowUp") {
			this.paddleLeftUp(gameEngine);
		}
		else if (input === "ArrowDown") {
			this.paddleLeftDown(gameEngine);
		}
		else
			console.log("Wrong PaddleLeftInput try something like ArrowUp or ArrowDown")
	}

	async paddleRightInput(input: string, gameEngine: GameEngine) {
		if (input === "ArrowUp") {
			this.paddleRightUp(gameEngine);
		}
		else if (input === "ArrowDown") {
			this.paddleRightDown(gameEngine);
		}
		else
			console.log("Wrong PaddleRightInput try something like ArrowUp or ArrowDown")
	}

	async paddleRightUp(gameEngine: GameEngine) {
		this.PaddleService.up(gameEngine.PaddleTwo);
		this.gameEngineRepository.save(gameEngine);
	}

	async paddleRightDown(gameEngine: GameEngine) {
		this.PaddleService.down(gameEngine.PaddleTwo);
		this.gameEngineRepository.save(gameEngine);
	}

	async paddleLeftDown(gameEngine: GameEngine) {
		this.PaddleService.down(gameEngine.PaddleOne);
		this.gameEngineRepository.save(gameEngine);
	}

	async paddleLeftUp(gameEngine: GameEngine) {
		this.PaddleService.up(gameEngine.PaddleOne);
		this.gameEngineRepository.save(gameEngine);
	}

	async createGameEngine(player1ID: string, player2ID: string) {
        const gameEngine = new GameEngine();
        const game: Game = await this.gameRepository.findOne({ where: { playerOneID: player1ID } })
        gameEngine.playerOneID = player1ID;
        gameEngine.playerTwoID = player2ID;
        gameEngine.scoreOne = 0;
        gameEngine.scoreTwo = 0;
        gameEngine.gameID = game.gameId;
        gameEngine.ball = await this.createAndSaveBall(41, 50, 10);
		gameEngine.PaddleOne = await this.createAndSavePaddle(10, 3, 306, 50);
        gameEngine.PaddleTwo = await this.createAndSavePaddle(10, 3, 0, 50);
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

	private async createAndSaveBall(x: number, y: number, r: number): Promise<Ball> {
        const ball= new Ball();
        ball.x = x;
        ball.y = y;
        ball.r = r;
		ball.speed = await this.createAndSaveVector(0,0);

        // Enregistrer le paddle dans la base de données
        await this.ballRepository.save(ball);

        return ball;
    }

	private async createAndSaveVector(x: number, y: number): Promise<Vector> {
        const vector = new Vector();
        vector.x = x;
		vector.y = y;
        // Enregistrer le Vector dans la base de données
        await this.vectorRepository.save(vector);

        return vector;
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

	async updateBall() {
		// changer la position de la balle avec la speed Vector, selon 16ms puis petite colision after et score
	}
}