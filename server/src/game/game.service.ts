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

interface GameInfoDto {
	userOneId: number;
	userTwoId: number;
	playerOneId: string;
	playerTwoId: string;
}


// export interface vector_instance {
//     x: number;
//     y: number;
// }


// export interface ball_instance {
//     position: vector_instance;
//     speed: vector_instance;
//     r: number;
//     alive: boolean;
//     elasticity: number;
//     player1Scored: boolean;
//     player2Scored: boolean;
// }

// export interface paddle_instance {
//     speed: number;
//     ArrowUp: boolean;
//     ArrowDown: boolean;
//     is_a_paddle: boolean;
//     length: number;
//     start: vector_instance;
//     end: vector_instance;
//     number: number;
// }

// export interface game_instance {
//     gameID: number;
//     playersLogin: string[];
//     player1_score: number;
//     player2_score: number;
//     game_has_started: boolean;
//     super_game_mode: boolean;
//     players: string[];
//     game_has_ended: boolean;
//     ball: ball_instance;
//     paddles: paddle_instance[];
//     victory_condition: number;
//     player1Joined: boolean;
//     player2Joined: boolean;
//     pause: boolean;
//     stop: boolean;
//     usersId: number[];
// }

// interface BallPosition {
// 	x: number,
// 	y: number,
// 	r: number,
// }

// let gameInstance: game_instance | null = null;

@Injectable()
export class GameService {
	// game_instance: game_instance[]
	constructor(
		@InjectRepository(Game)
		private gameRepository: Repository<Game>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private readonly GameEngineService: GameEngineService,

	) {

	this.userGameSockets = {};
	this.disconnections = {};
	// this.game_instance = [];
	}

	userGameSockets: { [userId: number]: string };
	disconnections: {[gameID: number]: string[]} ;

	async disconnectSocket(socketId: string, gameID: number) {
		const userId = this.getUserIdWithSocketId(socketId);
		const user: User = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user)
			throw new Error("disconnect socket not found user");
		user.inGame = false;
		await this.usersRepository.save(user);
		this.disconnections[gameID].push(socketId)
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

	async getLoginByUserId(userId: number)
	{
		const user: User = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user)
			throw new Error("getLoginByUserID not found")
		return (user.login);
	}

	// async gameInvite(server: any, client: any, gameInfoDto: GameInfoDto ) {
	// 		const playerTwoLogin = await this.getLoginByUserId(gameInfoDto.userTwoId)
	// 		const playerOneLogin = await this.getLoginByUserId(gameInfoDto.userOneId)
    //         server.to([gameInfoDto.playerTwoId]).emit('acceptInvitation');
    //         if (!this.userHasAlreadyGameSockets(gameInfoDto.userOneId)) {
    //             if (!this.userHasAlreadyGameSockets(gameInfoDto.userTwoId)) {
	// 				this.addGameInviteSocket(client.id, gameInfoDto.userOneId, gameInfoDto.playerTwoId, gameInfoDto.userTwoId);
    //                 await this.linkSocketIDWithUser(client.id, gameInfoDto.userOneId);
    //                 await this.linkSocketIDWithUser(gameInfoDto.playerTwoId, gameInfoDto.userTwoId);
    //                 // creating a personnal room so we can emit to the user
    //                 client.join(playerOneLogin);
    //                 client.join(playerTwoLogin);
    //                 let game = await this.createGame(client.id, gameInfoDto.playerTwoId, "NORMAL");
    //                 if (!game)
	// 				throw new Error("Fatal error");
	// 			const gameInstance: game_instance = this.GameEngineService.createGameInstance(game);
	// 			this.game_instance.push(gameInstance);
	// 			server.to([client.id, gameInfoDto.playerTwoId]).emit('setGameInvited');
	// 			server.to([client.id, gameInfoDto.playerTwoId]).emit('joinGame', {
    //                     gameId: game.gameId,
    //                     playerOneID: game.playerOneID,
    //                     playerTwoID: game.playerTwoID,
    //                     playerOneLogin: game.playerOneLogin,
    //                     playerTwoLogin: game.playerTwoLogin,
    //                     scoreOne: game.scoreOne,
    //                     scoreTwo: game.scoreTwo,
    //                 });
    //                 setTimeout(() => {
	// 					console.log("OUINOUIN");
    //                     server.to([client.id, gameInfoDto.playerTwoId]).emit('gameStart', {
    //                         gameId: game.gameId,
    //                         playerOneID: game.playerOneID,
    //                         playerTwoID: game.playerTwoID,
    //                         playerOneLogin: game.playerOneLogin,
    //                         playerTwoLogin: game.playerTwoLogin,
    //                         scoreOne: game.scoreOne,
    //                         scoreTwo: game.scoreTwo,
    //                     });
    //                 }, 1000);
    //             }
    //             else {
    //                 console.log(`User have already socket : ${playerTwoLogin}`)
    //                 server.to([client.id, gameInfoDto.playerTwoId]).emit('gameInProgress');
    //             }
    //         }
    //         else {
    //             console.log(`User have already socket : ${playerOneLogin}`)
    //             server.to([client.id, gameInfoDto.playerTwoId]).emit('gameInProgress');
    //         }
	// }
	
	async createGame(player1ID: string, player2ID: string, gameMode: string): Promise<Game> {
		const playersLogin: [string, string] = await this.getLoginByIDpairStartGame(player1ID, player2ID);
		const usersId: [number, number] = await this.getUserIdByIDpairStartGame(player1ID, player2ID);
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
		// console.log(`playerTwo id: ${player2ID}`);
		const UserOne: User = await this.usersRepository.findOne({ where: { gameSocketId: player1ID } })
		const UserTwo: User = await this.usersRepository.findOne({ where: { gameSocketId: player2ID } })

		// console.log("USER ONE: ", UserOne);
		// console.log("USER TWO: ", UserTwo);
		UserOne.inMatchmaking = false;
		UserOne.inSpeedQueue = false;
		UserOne.inGame = true;
		UserTwo.inMatchmaking = false;
		UserTwo.inSpeedQueue = false;
		UserTwo.inGame = true;
		await this.usersRepository.save(UserOne);
		await this.usersRepository.save(UserTwo);
		if (UserOne && UserTwo) {
			const usersId: [number, number] = [UserOne.id, UserTwo.id]
			// console.log("Players login : ", playersLogin);
			return (usersId);
		}
	}

	getUserIdWithSocketId(socketId: string): number {
		console.log(`userGameSocket : ${this.userGameSockets[1]}, userId: ${1}`);
		for (const [userIdValue, socketIdValue] of Object.entries(this.userGameSockets)) {
			console.log("USERID VALUE: ", Number(userIdValue), "socket :", socketIdValue, "||||", this.userGameSockets[1] );
			if (socketIdValue === socketId) {
				return Number(userIdValue);
			}
		}
		return (0);
	}

	async getUserWithUserId(userId: number): Promise<User> {
		const user: User = await this.usersRepository.findOne({ where: { id: userId } });
		return (user);
	}

	async userInGameOrInMacthmaking(user: User) {
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
		const otherPlayer: User = await this.usersRepository.findOne({ where: { gameSocketId: playerID } })
		// console.log(`otherplayerID link : ${playerID}, ${otherPlayer.gameSocketId}`)
		return;
	}

	async getLoginByIDpairStartGame(player1ID: string, player2ID: string) {
		// console.log(`playerTwo id: ${player2ID}`);
		const UserOne: User = await this.usersRepository.findOne({ where: { gameSocketId: player1ID } })
		const UserTwo: User = await this.usersRepository.findOne({ where: { gameSocketId: player2ID } })

		// console.log("USER ONE: ", UserOne);
		// console.log("USER TWO: ", UserTwo);
		UserOne.inMatchmaking = false;
		UserOne.inSpeedQueue = false;
		UserOne.inGame = true;
		UserTwo.inMatchmaking = false;
		UserTwo.inSpeedQueue = false;
		UserTwo.inGame = true;
		await this.usersRepository.save(UserOne);
		await this.usersRepository.save(UserTwo);
		if (UserOne && UserTwo) {
			const playersLogin: [string, string] = [UserOne.login, UserTwo.login]
			// console.log("Players login : ", playersLogin);
			return (playersLogin);
		}
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
		return (game);
	}

	async endOfGame(game: Game, gameInstance: game_instance): Promise<Game> {
		console.log("==== END OF GAME ====");
		const UserOne: User = await this.usersRepository.findOne({ where: { gameSocketId: gameInstance.players[0] } })
		const UserTwo: User = await this.usersRepository.findOne({ where: { gameSocketId: gameInstance.players[1] } })
		UserOne.inGame = false;
		UserTwo.inGame = false;

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

		game.userOneId = UserOne.id;
		game.userTwoId = UserTwo.id;
		game.gameEnd = true;
		game.scoreOne = gameInstance.player1_score;
		game.scoreTwo = gameInstance.player2_score;
		await this.gameRepository.save(game);
		return (game);
	}

	getGameInstance(gametab: game_instance[], gameID: number) {
		return gametab.find(instance => instance.gameID === gameID);
	}

	userHasAlreadyGameSockets(userId: number) {
		if (typeof (this.userGameSockets[userId]) === "undefined") {
			console.log(`"undefined"`)
			return false;
		}
		if (typeof (this.userGameSockets[userId]) === undefined) {
			console.log(`undefined`)
			return false;
		}
		if (this.userGameSockets[userId] === null) {
			console.log(`null`)
			return false;
		}
		console.log(`user ${userId} has already game socket : ${this.userGameSockets[userId]}`);
		return true;
	}

	addGameSocket(gameSocketId: string, userId: number) {
		this.userGameSockets[userId] = gameSocketId;
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

	async deconnectUserMatchmaking(user: User, userId: number) {
		console.log(`userGameSocket : ${this.userGameSockets[userId]}, userId: ${userId}`);
		user.inMatchmaking = false;
		this.userGameSockets[userId] = null;
		await this.usersRepository.save(user);
	}

	async getGameWithUserId(userId: number): Promise<Game> {
        console.log(`[${this.userGameSockets[userId]}] userId de ses morts gameWithUserLogin: ${userId}`);
		const gameOne = await this.gameRepository.findOne({ where: { playerOneID: this.userGameSockets[userId] } })
		if (gameOne) {
			return gameOne;
		}
		const gameTwo = await this.gameRepository.findOne({ where: { playerTwoID: this.userGameSockets[userId] } })
		if (gameTwo)
			return gameTwo;
	}

	async getOtherUser(game: Game, user: User): Promise<User> {
		let otherUser: User = null;
		if (user.id === game.userOneId) {
			otherUser = await this.usersRepository.findOne({ where: { id: user.id } })
		}
		else if (user.id === game.userTwoId) {
			otherUser = await this.usersRepository.findOne({ where: { id: user.id} })
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
		console.log("delete sockets: ");
	}

	deleteGameSocketsIdForPlayer(userId: number) {
		this.userGameSockets[userId] = null;
	}

	async updateStateGameForUser(user: User) {
		user.inGame = false;
		await this.usersRepository.save(user);
	}
}