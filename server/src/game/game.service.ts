import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/games.entity';
import { GameModule } from './game.module';
import { env } from 'process';
import { User } from 'src/users/entities/users.entity';
import { Paddle } from './entities/paddle.entity';
import { game_instance, userGameSockets } from 'src/game_gateway/game.gateway';


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
        
    userGameSockets : { [userId: string]: string };
    
    async createGame(player1ID: string, player2ID: string): Promise<Game> {

        console.log("Creating new GAME...");
        const playersLogin: [string, string] = await this.getLoginByIDpair(player1ID, player2ID);
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


    async linkSocketIDWithUser(playerID: string, playerLogin: string) {

        const Player: User = await this.usersRepository.findOne({ where: { login: playerLogin } })
        if (Player && playerID) {
            Player.socketGame = playerID;
            await this.usersRepository.save(Player);
        }

        return ;
    }

    async getLoginByIDpair(player1ID: string, player2ID: string) {

        const UserOne: User = await this.usersRepository.findOne({ where: { socketGame: player1ID } })
        const UserTwo: User = await this.usersRepository.findOne({ where: { socketGame: player2ID } })

        console.log("USER ONE: ", UserOne);
        console.log("USER TWO: ", UserTwo);
        // UserOne.inMatchmaking = false;
        // UserOne.inGame = true;
        // UserTwo.inMatchmaking = false;
        // UserTwo.inGame = true;
        // await this.usersRepository.save(UserOne);
        // await this.usersRepository.save(UserTwo);
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
        const UserOne: User = await this.usersRepository.findOne({ where: { socketGame: gameInstance.players[0] } })
        const UserTwo: User = await this.usersRepository.findOne({ where: { socketGame: gameInstance.players[1] } })
        // UserOne.inGame = false;
        // UserTwo.inGame = false;

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

    userHasAlreadyGameSockets(userId: string) {
        if (this.userGameSockets[userId])
            return true;
        return false;
    }

    addGameSocket(gameSocketId: string, userId: string) {
        this.userGameSockets[userId].push(gameSocketId);
    }

    getMyGameSockets(userId: string) {
        return this.userGameSockets[userId];
    }
    createNewGameSockets(userId: string) {
        this.userGameSockets[userId] = [];
    }

    getUserGameSocketsGate(userGameSocketsGate: userGameSockets[], userId: string) {
        return userGameSocketsGate.find(instance => instance.userId === userId);
    }

    newUserGameSocketsGate(userId: string) {
        const newUserGameSockets: userGameSockets = {
            userId: userId,
            gameSocketsId: null
        }
        return newUserGameSockets;
    }
 }