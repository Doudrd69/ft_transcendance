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

    async createGame(player1ID: string, player2ID: string): Promise<Game> {

        const game = new Game();
        console.log("New Game Create");
        const playersLogin: [string, string] = await this.getLoginByIDpair(player1ID, player2ID);
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


    async linkSocketIDWithUser(playerID: string, playerLogin: string) {

        const Player: User = await this.usersRepository.findOne({ where: { login: playerLogin } })
        if (Player && playerID) {
            Player.socketGame = playerID;
            this.usersRepository.save(Player);
        }
    }

    async getLoginByIDpair(player1ID: string, player2ID: string) {

        const UserOne: User = await this.usersRepository.findOne({ where: { socketGame: player1ID } })
        const UserTwo: User = await this.usersRepository.findOne({ where: { socketGame: player2ID } })
        UserOne.inMatchmaking = false;
        UserOne.inGame = true;
        UserTwo.inMatchmaking = false;
        UserTwo.inGame = true;
        this.usersRepository.save(UserOne);
        this.usersRepository.save(UserTwo);
        const playersLogin: [string, string] = [UserOne.login, UserTwo.login]
        return (playersLogin);
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
        const UserOne: User = await this.usersRepository.findOne({ where: { socketGame: gameInstance.players[0] } })
        const UserTwo: User = await this.usersRepository.findOne({ where: { socketGame: gameInstance.players[1] } })
        UserOne.inGame = false;
        UserTwo.inGame = false;
        this.usersRepository.save(UserOne);
        this.usersRepository.save(UserTwo);
        game.gameEnd = true;
        game.scoreOne = gameInstance.player1_score;
        game.scoreTwo = gameInstance.player2_score;
        this.gameRepository.save(game);
        return (game);
    }

    getGameInstance(gametab: game_instance[], gameID: number) {
        return gametab.find(instance => instance.gameID === gameID);;
    }
}