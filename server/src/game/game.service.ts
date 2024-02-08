import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/games.entity';
import { GameModule } from './game.module';
import { env } from 'process';
import { User } from 'src/users/entities/users.entity';
import { Paddle } from './entities/paddle.entity';
import { GameEngineService } from './gameEngine.service';
import { game_instance } from 'src/game_gateway/game.gateway';
import { MatchmakingService } from './matchmaking/matchmaking.service';

interface GameInfoDto {
	userOneId: number;
	userTwoId: number;
	playerOneId: string;
	playerTwoId: string;
}

export class GameService {
	constructor(
		@InjectRepository(Game)
		private gameRepository: Repository<Game>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private readonly GameEngineService: GameEngineService,
		private readonly MatchmakingService: MatchmakingService,

	) {

		this.userGameSockets = {};
		this.disconnections = {};
	}

	userGameSockets: { [userId: number]: string };
	disconnections: { [gameID: number]: string[] };

	async disconnectSocket(userId: number, gameID: number, socketId: string) {
		try {
			const user: User = await this.usersRepository.findOne({ where: { id: userId } });
			if (!user)
				throw new Error();
			user.inGame = false;
			await this.usersRepository.save(user);
			this.disconnections[gameID].push(socketId)
		}
		catch (error) {
			console.log(`[DISCONNECTSOCKET] NOT HANDLE ERROR: ${error.stack}`);
		}
	}

	setUpDisconnection(gameId: number) {
		this.disconnections[gameId] = []
	}

	getDisconnections(gameId: number): string[] {
		return this.disconnections[gameId]
	}

	async clearDisconnections(gameId: number) {
		this.disconnections[gameId] = []
	}

	async getLoginByUserId(userId: number) {
		const user: User = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user)
			throw new Error("getLoginByUserID not found")
		return (user.login);
	}

	async createGame(player1ID: string, player2ID: string, gameMode: string): Promise<Game> {
		const usersId: [number, number] = await this.getUserIdByIDpairStartGame(player1ID, player2ID);
		const playersLogin: [string, string] = await this.getLoginByUserIdStartGame(usersId[0], usersId[1]);
		const game = new Game();
		game.playerOneID = player1ID;
		game.playerTwoID = player2ID;
		game.playerOneLogin = playersLogin[0];
		game.playerTwoLogin = playersLogin[1];
		game.scoreOne = 0;
		game.scoreTwo = 0;
		game.gameEnd = false;
		game.userOneId = usersId[0];
		game.userTwoId = usersId[1];
		if (gameMode === "SPEED")
			game.gameMode = "SPEED";
		await this.gameRepository.save(game);
		return (game);
	}

	async getUserIdByIDpairStartGame(player1ID: string, player2ID: string) {
		const UserOne: User = await this.usersRepository.findOne({ where: { gameSocketId: player1ID } })
		const UserTwo: User = await this.usersRepository.findOne({ where: { gameSocketId: player2ID } })
		if (!UserOne || !UserTwo)
			throw new Error(`[getUserIdByIDpairStartGame]: Users not found`);
		UserOne.inGame = true;
		UserTwo.inGame = true;
		await this.usersRepository.save(UserOne);
		await this.usersRepository.save(UserTwo);
		if (UserOne && UserTwo) {
			const usersId: [number, number] = [UserOne.id, UserTwo.id]
			return (usersId);
		}
	}

	getUserIdWithSocketId(socketId: string): number | null {
		for (const userId in this.userGameSockets) {
			if (this.userGameSockets.hasOwnProperty(userId)) {
				if (this.userGameSockets[userId] === socketId) {
					return Number(userId); // Convertir la clé en nombre
				}
			}
		}
		return null;
	}

	async getUserWithUserId(userId: number): Promise<User> {
		const user: User = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user)
			throw new Error(`getUserWithUSerId undefined`);
		return (user);
	}

	async userInGameOrInMacthmaking(user: User) {
		console.log(`user ingame : ${user.inGame}, user inmatchmaking: ${user.inMatchmaking}`);
		if (user.inGame === true || user.inMatchmaking === true)
			return true;
		return false;
	}

	async linkSocketIDWithUser(playerID: string, userId: number) {
		const Player: User = await this.usersRepository.findOne({ where: { id: userId } })
		if (!Player)
			throw new Error()
		Player.gameSocketId = playerID;
		// console.log(`playerID link : ${playerID}, ${Player.gameSocketId}`)
		await this.usersRepository.save(Player);
		// console.log(`otherplayerID link : ${playerID}, ${otherPlayer.gameSocketId}`)
		return;
	}

	async getLoginByUserIdStartGame(userId1: number, userId2: number) {
		const UserOne: User = await this.usersRepository.findOne({ where: { id: userId1 } })
		const UserTwo: User = await this.usersRepository.findOne({ where: { id: userId2 } })
		if (!UserOne || !UserTwo)
			throw new Error(`[getLoginByUserIdStartGame  ERROR]: Users not found`);
		const playersLogin: [string, string] = [UserOne.username, UserTwo.username]
		return (playersLogin);
	}

	async deleteGame(game: Game) {
		await this.gameRepository.delete(game);
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
		if (!game)
			throw new Error(`game Not Found`);
		return (game);
	}

	async endOfGame(game: Game, gameInstance: game_instance): Promise<Game> {
		console.log("==== END OF GAME ====");
		const UserOne: User = await this.usersRepository.findOne({ where: { gameSocketId: gameInstance.players[0] } })
		const UserTwo: User = await this.usersRepository.findOne({ where: { gameSocketId: gameInstance.players[1] } })
		if (!UserOne || !UserTwo)
			throw new Error(`[endOfGame not found Users]`);
		UserOne.inGame = false;
		UserTwo.inGame = false;

		game.scoreOne = gameInstance.player1_score;
		game.scoreTwo = gameInstance.player2_score;
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


		game.userOneId = UserOne.id;
		game.userTwoId = UserTwo.id;
		game.gameEnd = true;
		await this.gameRepository.save(game);
		return (game);
	}

	getGameInstance(gametab: game_instance[], gameID: number) {
		return gametab.find(instance => instance.gameID === gameID);
	}

	userHasAlreadyGameSockets(userId: number, gameSocketId: string) {
		if (typeof (this.userGameSockets[userId]) === "undefined") {
			return false;
		}
		if (typeof (this.userGameSockets[userId]) === undefined) {
			return false;
		}
		if (this.userGameSockets[userId] === null) {
			return false;
		}
		if (this.userGameSockets[userId] === gameSocketId)
			return false;
		console.log(`user ${userId} has already game socket : ${this.userGameSockets[userId]}`);
		return true;
	}

	addGameSocket(gameSocketId: string, userId: number) {
		this.userGameSockets[userId] = gameSocketId;
	}

	async setUserInMatchmaking(userId: number) {
		let user: User = await this.getUserWithUserId(userId);
		user.inMatchmaking = true;
		await this.usersRepository.save(user);
	}

	addGameInviteSocket(gameSocketIdOne: string, userOneId: number, gameSocketIdTwo: string, userTwoId: number) {
		this.userGameSockets[userOneId] = gameSocketIdOne;
		this.userGameSockets[userTwoId] = gameSocketIdTwo;
	}

	getMyGameSockets(userId: number) {
		return this.userGameSockets[userId];
	}
	createNewGameSockets(userId: number) {
		this.userGameSockets[userId] = null;
	}

	async deconnectUserMatchmaking(user: User, userId: number, playerId: string) {
		console.log(`userGameSocket : ${this.userGameSockets[userId]}, userId: ${userId}`);
		user.inMatchmaking = false;
		this.userGameSockets[userId] = null;
		await this.MatchmakingService.leaveQueue(playerId, userId)
		// appeler une fonction qui l'enleve de matchmaking queue hophop
		await this.usersRepository.save(user);
	}

	async getGameWithUserId(userId: number): Promise<Game> {
		// console.log(`[${this.userGameSockets[userId]}] userId de ses morts gameWithUserLogin: ${userId}`);
		const gameOne = await this.gameRepository.findOne({ where: { playerOneID: this.userGameSockets[userId] } })
		if (gameOne) {
			return gameOne;
		}
		const gameTwo = await this.gameRepository.findOne({ where: { playerTwoID: this.userGameSockets[userId] } })
		if (gameTwo)
			return gameTwo;
		throw new Error(`[getGameWithUserId ERROR]: gameNotFound`); // estce bien nessecaire?
	}

	async getGameWithGameId(gameId: number) {
		const gameOne = await this.gameRepository.findOne({ where: { gameId: gameId } })
		if (!gameOne)
			throw new Error(`[getGameWithGameId]: game not found`);
		return gameOne;
	}

	async getOtherUser(game: Game, user: User): Promise<User> {
		let otherUser: User = null;
		if (user.id === game.userOneId) {
			otherUser = await this.usersRepository.findOne({ where: { id: user.id } })
			if (!otherUser)
				throw new Error(`[getOtherUser]: user not found`);
		}
		else if (user.id === game.userTwoId) {
			otherUser = await this.usersRepository.findOne({ where: { id: user.id } })
			if (!otherUser)
				throw new Error(`[getOtherUser]: user not found`);
		}
		return otherUser
	}

	async updateStateGameForUsers(user: User, otherUser: User) {
		user.inGame = false;
		otherUser.inGame = false;
		await this.usersRepository.save(user);
		await this.usersRepository.save(otherUser);
	}

	deleteGameSocketsIdForPlayers(user: User, otherUser: User) {
		this.userGameSockets[user.id] = null;
		this.userGameSockets[otherUser.id] = null;
	}

	deleteGameSocketsIdForPlayer(userId: number) {
		this.userGameSockets[userId] = null;
	}

	async updateStateGameForUser(user: User) {
		user.inGame = false;
		await this.usersRepository.save(user);
	}

	async createGameStop(user1: User, user2: User, gameInstance: game_instance, disconnectedSockets: string[]) {
		console.log("==== STOP GAME ====");
		let game = new Game;
		game.playerOneID = gameInstance.players[0];
		game.playerTwoID = gameInstance.players[1];
		game.playerOneLogin = gameInstance.playersLogin[0];
		game.playerTwoLogin = gameInstance.playersLogin[1];
		game.scoreOne = 5;
		game.scoreTwo = 5;
		game.gameEnd = false;
		game.userOneId = gameInstance.usersId[0];
		game.userTwoId = gameInstance.usersId[1];
		user1.inGame = false;
		user2.inGame = false;
		if (disconnectedSockets.includes(gameInstance.players[1])) {

			console.log(`[createGameStop] : player[1]: ${user2.login}`)
			game.scoreTwo = 0;
		}
		if (disconnectedSockets.includes(gameInstance.players[0])) {
			console.log(`[createGameStop] : player[0]: ${user1.login}`)
			game.scoreOne = 0;
		}
		if (game.scoreOne > game.scoreTwo) {
			user1.victory += 1;
			user2.defeat += 1;
		}
		else if (game.scoreOne < game.scoreTwo) {
			user1.defeat += 1;
			user2.victory += 1;
		}
		console.log(`[createGameStop] : scoreOne: ${game.scoreOne}, scoreTwo: ${game.scoreTwo}`);
		await this.usersRepository.save(user1);
		await this.usersRepository.save(user2);

		game.gameEnd = true;
		await this.gameRepository.save(game);
	}
}