import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/games.entity';
import { GameModule } from './game.module';
import { env } from 'process';
import { User } from 'src/users/entities/users.entity';
import { Paddle } from './entities/paddle.entity';
import { game_instance } from 'src/game_gateway/game.gateway';


interface BallPosition {
	x: number,
	y: number,
	r: number,
}



@Injectable()
export class GameService {
	constructor(
		@InjectRepository(Game)
		private gameRepository: Repository<Game>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,

		
		) { }
		
	userGameSockets : { [userLogin: string]: string };
	
	async createGame(player1ID: string, player2ID: string): Promise<Game> {

		console.log("Creating new GAME...");
		const playersLogin: [string, string] = await this.getLoginByIDpairStartGame(player1ID, player2ID);
		if (playersLogin) {
			const game = new Game();
			game.playerOneID = player1ID;
			game.playerTwoID = player2ID;
			game.playerOneLogin = playersLogin[0];
			game.playerTwoLogin = playersLogin[1];
			game.scoreOne = 0;
			game.scoreTwo = 0;
			game.gameEnd = false;
			await this.gameRepository.save(game);
			return (game);
		}

		return ;
	}

	getUserLoginWithSocketId(socketId: string) {
		for (const [userLogin, socketIdValue] of Object.entries(this.userGameSockets)) {
			if (socketIdValue === socketId) {
				console.log(`getUserIdWithSocketId: ${userLogin}`);
			  return userLogin;
			}
		}
		return (null);
	}

	async getUserWithUserLogin(userLogin: string): Promise<User> {
		const user: User = await this.usersRepository.findOne({ where: { login: userLogin } });
		return (user);
	}

	async userInGameOrInMacthmaking(user: User)
	{
		if (user.inGame === true || user.inMatchmaking === true)
			return true;
		return false;
	}

	async linkSocketIDWithUser(playerID: string, playerLogin: string) {

		const Player: User = await this.usersRepository.findOne({ where: { login: playerLogin } })
		if (Player && playerID) {
			Player.gameSocketId = playerID;
			await this.usersRepository.save(Player);
		}

		return ;
	}

	async getLoginByIDpairStartGame(player1ID: string, player2ID: string) {

		const UserOne: User = await this.usersRepository.findOne({ where: { gameSocketId: player1ID } })
		const UserTwo: User = await this.usersRepository.findOne({ where: { gameSocketId: player2ID } })

		console.log("USER ONE: ", UserOne);
		console.log("USER TWO: ", UserTwo);
		UserOne.inMatchmaking = false;
		UserOne.inGame = true;
		UserTwo.inMatchmaking = false;
		UserTwo.inGame = true;
		await this.usersRepository.save(UserOne);
		await this.usersRepository.save(UserTwo);
		if (UserOne && UserTwo) {
			const playersLogin: [string, string] = [UserOne.login, UserTwo.login]
			console.log("Players login : ", playersLogin);
			return (playersLogin);
		}
	}

	async deleteGame(playerID: string) {
		const game: Game = await this.gameRepository.findOne({ where: { playerOneID: playerID } })
		// peut etre supprimer les game interrompu
	}

	playerJoined(playerID: string, gameInstance: game_instance) {
		if (playerID === gameInstance.players[0])
			gameInstance.player1Joined = true;
		if (playerID === gameInstance.players[1])
			gameInstance.player2Joined = true;
	}


	everyPlayersJoined(gameInstance: game_instance) {
		if (gameInstance.player1Joined === true && gameInstance.player2Joined === true)
			return true;
		return false;
	}

	async getGameByID(gameID: number): Promise<Game> {
		const game: Game = await this.gameRepository.findOne({ where: { gameId: gameID } })
		return (game);
	}

	async endOfGame(game: Game, gameInstance: game_instance): Promise<Game> {
		console.log("==== END OF GAME ====");
		const UserOne: User = await this.usersRepository.findOne({ where: { gameSocketId: gameInstance.players[0] } })
		const UserTwo: User = await this.usersRepository.findOne({ where: { gameSocketId: gameInstance.players[1] } })
		UserOne.inGame = false;
		UserTwo.inGame = false;
		// delete les sockets et le userLoginsocketsomposr

		console.log("Before U1: ", UserOne.victory, UserOne.defeat);
		console.log("Before U2: ", UserTwo.victory, UserTwo.defeat);
		if (game.scoreOne > game.scoreTwo) {
			UserOne.victory += 1;
			UserTwo.defeat += 1;
		}
		else {
			UserOne.defeat += 1;
			UserTwo.victory += 1;
		}

		await this.usersRepository.save(UserOne);
		await this.usersRepository.save(UserTwo);

		console.log("After U1: ", UserOne.victory, UserOne.defeat);
		console.log("After U2: ", UserTwo.victory, UserTwo.defeat);

		game.playerOneID = String(UserOne.id);
		game.playerTwoID = String(UserTwo.id);
		game.gameEnd = true;
		game.scoreOne = gameInstance.player1_score;
		game.scoreTwo = gameInstance.player2_score;
		await this.gameRepository.save(game);
		return (game);
	}

	getGameInstance(gametab: game_instance[], gameID: number) {
		return gametab.find(instance => instance.gameID === gameID);
	}

	userHasAlreadyGameSockets(userLogin: string) {
		// console.log(`login: ${userLogin}`)
		// if (typeof(this.userGameSockets[userLogin]) == "undefined")
		//     return false;
		// console.log(`"undefined"`)
		// if (typeof(this.userGameSockets[userLogin]) == undefined)
		//     return false;
		// console.log(`undefined`)
		// if (this.userGameSockets[userLogin] === null)
		//     return false;
		//     console.log(`null`)




		return false;
	}

	addGameSocket(gameSocketId: string, userLogin: string) {
		this.userGameSockets[userLogin] = gameSocketId;
	}

	getMyGameSockets(userLogin: string) {
		return this.userGameSockets[userLogin];
	}
	createNewGameSockets(userLogin: string) {
		this.userGameSockets[userLogin] = null;
	}

	async deconnectUserMatchmaking(user: User, userLogin: string) {
		user.inMatchmaking = false;
		this.userGameSockets[userLogin] = null;
		await this.usersRepository.save(user);
	}

	async getGameWithUserLogin(userLogin: string): Promise<Game> {
		const gameOne = await this.gameRepository.findOne({ where: { playerOneID: this.userGameSockets[userLogin] } })
		if (gameOne) {
			return gameOne;
		}
		const gameTwo = await this.gameRepository.findOne({ where: { playerTwoID: this.userGameSockets[userLogin] } })
		if (gameTwo)
			return gameTwo;
		else
			throw new Error("Fatal error");
	}

	async getOtherUser(game: Game, user: User) {
		let otherUser;
		if (user.login === game.playerOneLogin) {
			otherUser = await this.usersRepository.findOne({ where: { login: user.login } })
		}
		else if (user.login === game.playerOneLogin) {
			otherUser = await this.usersRepository.findOne({ where: { login: user.login } })
		}
	}

 }