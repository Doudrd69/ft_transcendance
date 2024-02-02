import { Injectable } from '@nestjs/common';
import { Game } from "./entities/games.entity";
import { PaddleService } from './gameObject/paddle.service';
import { BallService } from './gameObject/ball.service';
import { game_instance, ball_instance, vector_instance } from 'src/game_gateway/game.gateway';

@Injectable()
export class GameEngineService {
	constructor(
		private readonly BallService: BallService,
		private readonly PaddleService: PaddleService,

	) { }


	createGameInstance(game: Game) {
		let signe = (Math.random() - 0.5) > 0 ? 1 : -1;
		const newGame: game_instance = {
			usersId: [game.userOneId, game.userTwoId],
			stop: false,
			pause: false,
			player1Joined: false,
			player2Joined: false,
			game_has_started: true,
			game_has_ended: false,
			gameID: game.gameId,
			ball: {
				player1Scored: false,
				player2Scored: false,
				position: { x: 0.5, y: 0.5},
				speed: { x: (signe / 100) * 0.177 * 1.5, y: (Math.random() - 0.5) * Math.random() / 60 * 10 },
				r: 0.02,
				alive: true,
				elasticity: 1.15,
			},
			player1_score: 0,
			player2_score: 0,
			players: [game.playerOneID, game.playerTwoID],
			playersLogin: [game.playerOneLogin, game.playerTwoLogin],
			super_game_mode: false,
			victory_condition: 1,
			paddles: [
				{ number: 1, speed: 1 / 80, ArrowUp: false, ArrowDown: false, end: { x: 0.025, y: 0.585 }, start: { x: 0.025, y: 0.415 }, is_a_paddle: true, length: 0.585 - 0.415 },
				{ number: 2, speed: 1 / 80, ArrowUp: false, ArrowDown: false, end: { x: 1 - 0.025, y: 0.585 }, start: { x: 1 - 0.025, y: 0.415 }, is_a_paddle: true, length: 0.585 - 0.415 },
			],
		}
		if (game.gameMode === "SPEED") {
			newGame.super_game_mode = true;
			newGame.ball.elasticity = 1.40;
		}
		return newGame;
	}

	switchInputUp(input: string, gameInstance: game_instance, playerId: string) {
		if (playerId === gameInstance.players[0]) {
			this.PaddleService.processInputUp(gameInstance.paddles[0], input);
		}
		else if (playerId === gameInstance.players[1]) {
			this.PaddleService.processInputUp(gameInstance.paddles[1], input);
		}
		else
			console.log("No Player find in GameEngine for this Input");
	}

	switchInputDown(input: string, gameInstance: game_instance, playerId: string) {
		if (playerId === gameInstance.players[0]) {
			this.PaddleService.processInputDown(gameInstance.paddles[0], input);
		}
		else if (playerId === gameInstance.players[1]) {
			this.PaddleService.processInputDown(gameInstance.paddles[1], input);
		}
		else
			console.log("No Player find in GameEngine for this Input");
	}

	processInput(gameInstance: game_instance) {
		this.PaddleService.updatePaddlePosition(gameInstance.paddles[0])
		this.PaddleService.updatePaddlePosition(gameInstance.paddles[1])
	}

	updateGameInstance(gameInstance: game_instance, server: any) {
		gameInstance.paddles.forEach((paddle) => {
			if (this.BallService.collisionWithPaddle(gameInstance.ball, paddle)) {
				// this.BallService.penetration_resolution_bw(gameInstance.ball, paddle); // then do the repositionning
				this.BallService.collision_resolution_bw(gameInstance.ball, paddle); // and the change in speed
			}
			//this.BallService.ballIntersectWithPaddle(gameInstance.ball, paddle)) 
		});
		if (gameInstance.ball.alive === false) {
			this.playerScoredIncr(gameInstance);
			this.resetGamePause(gameInstance, server);
		}
		gameInstance.ball = this.updateBall(gameInstance.ball);
	}

	playerScoredIncr(gameInstance: game_instance) {
		if (gameInstance.ball.player1Scored === true) {
			gameInstance.player1_score += 1;
		}
		if (gameInstance.ball.player2Scored === true) {
			gameInstance.player2_score += 1;
		}
	}

	resetGamePause(gameInstance: game_instance, server: any) {
		gameInstance.ball.player1Scored = false;
		gameInstance.ball.player2Scored = false;
		gameInstance.pause = true;
		if (gameInstance.player1_score === gameInstance.victory_condition || gameInstance.player2_score === gameInstance.victory_condition) {
			console.log("QUIT")
			gameInstance.game_has_ended = true;
			return;
		}
		let signe = (Math.random() - 0.5) > 0 ? 1 : -1;
		gameInstance.ball.position.x = 0.5;
		gameInstance.ball.position.y = 0.5;
		gameInstance.ball.speed = { x: (signe / 100) * 0.177 * 1.5, y: (Math.random() - 0.5) * Math.random() / 60};
		gameInstance.paddles = [
			{ number: 1, speed: 1 / 80, ArrowUp: false, ArrowDown: false, end: { x: 0.025, y: 0.585 }, start: { x: 0.025, y: 0.415 }, is_a_paddle: true, length: 0.17 },
			{ number: 2, speed: 1 / 80, ArrowUp: false, ArrowDown: false, end: { x: 1 - 0.025, y: 0.585 }, start: { x: 1 - 0.025, y: 0.415 }, is_a_paddle: true, length: 0.17 },
		]
		server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GameGoal', {
			BallPosition: { x: gameInstance.ball.position.x, y: gameInstance.ball.position.y },
			scoreOne: gameInstance.player1_score,
			scoreTwo: gameInstance.player2_score,
			paddleOne: { x: gameInstance.paddles[0].start.x - 0.025, y: gameInstance.paddles[0].start.y, width: 0.025, height: gameInstance.paddles[0].end.y - gameInstance.paddles[0].start.y},
			paddleTwo: { x: gameInstance.paddles[1].start.x, y: gameInstance.paddles[1].start.y, width: 0.025, height: gameInstance.paddles[1].end.y - gameInstance.paddles[1].start.y},
		});
		setTimeout(() => {
			gameInstance.pause = false;
			gameInstance.ball.alive = true;
		}, 3000);
		return;
	}

	updateBall(ball: ball_instance) {
		return (this.BallService.updateBallPosition(ball));
	}
}