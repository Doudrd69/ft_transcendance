import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/games.entity';
import { GameModule } from './game.module';
import { env } from 'process';
import { User } from 'src/users/entities/users.entity';
import { GameEngine } from './entities/gameEngine.entity';
import { Ball } from './gameObject/ball';
import { Paddle } from './gameObject/paddle';


@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Game)
        private gameRepository: Repository<Game>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(GameEngine)
        private gameEngineRepository: Repository<GameEngine>,

        
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
        await this.gameRepository.save(game);
        return (game);
    }


    async linkSocketIDWithUser(playerID: string, playerLogin: string) {

        const Player: User = await this.usersRepository.findOne({ where: { login: playerLogin } })
        Player.socketGame = playerID;
        this.usersRepository.save(Player);
    }

    async getLoginByIDpair(player1ID: string, player2ID: string) {

        const UserOne: User = await this.usersRepository.findOne({ where: { socketGame: player1ID } })
        const UserTwo: User = await this.usersRepository.findOne({ where: { socketGame: player2ID } })
        const playersLogin: [string, string] = [UserOne.login, UserTwo.login]
        return (playersLogin);
    }


    async createGameEnginge(player1ID: string, player2ID: string) {
        const gameEngine = new GameEngine();
        const game: Game = await this.gameRepository.findOne({ where: { playerOneID: player1ID } })
        gameEngine.playerOneID = player1ID;
        gameEngine.playerTwoID = player2ID;
        gameEngine.scoreOne = 0;
        gameEngine.scoreTwo = 0;
        gameEngine.gameID = game.gameId;
        gameEngine.ball = new Ball(10, 10, 10);
        gameEngine.Paddles[0] = new Paddle(0.10, 0.03, 20, 0);
        gameEngine.Paddles[1] = new Paddle(0.10, 0.03, 0, 0);
        await this.gameEngineRepository.save(gameEngine);
        return (gameEngine);

    }

    /**
     * devoir creer soit un GameState avec dedans paddle 1 et 2 et ball
     * ou quelque chose qui a l'air plus clean mais qu'il faut que je comprenne c'est
     * cree des class wall et ball qui me permette d'avoir de l'oriente objet et leur ft
     * 
     */
}
