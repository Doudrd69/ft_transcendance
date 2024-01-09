import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from "src/users/entities/users.entity";
import { Game } from "./entities/games.entity";
import { GameEngine } from "./entities/gameEngine.entity";

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


	) { }

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
		gameEngine.Paddles[1].up();
	}

	async paddleRightDown(gameEngine: GameEngine) {
		gameEngine.Paddles[1].down();
	}

	async paddleLeftDown(gameEngine: GameEngine) {
		gameEngine.Paddles[0].down();
	}

	async paddleLeftUp(gameEngine: GameEngine) {
		gameEngine.Paddles[0].up();
	}


	async getGameEngine(player1ID: string): Promise<GameEngine> {
		const gameEngine: GameEngine = await this.gameEngineRepository.findOne({ where: { playerOneID: player1ID } })
		return (gameEngine);
	}
}