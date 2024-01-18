import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { GameModule } from './game.module';
import { env } from 'process';
import { User } from 'src/users/entities/users.entity';
import { GameEngine } from './entities/gameEngine.entity';
import { Paddle } from './entities/paddle.entity';


interface BallPosition {
	x: number,
	y: number,
	r: number,
}

/**
 * use to share the game state
 */
interface GameState {
	BallPosition: BallPosition[],
	paddleOne: {x: number, y: number },
	paddleTwo: {x: number, y:number },
}


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
        if (Player && playerID) {
            Player.socketGame = playerID;
            this.usersRepository.save(Player);
        }
    }

    async getLoginByIDpair(player1ID: string, player2ID: string) {

        const UserOne: User = await this.usersRepository.findOne({ where: { socketGame: player1ID } })
        const UserTwo: User = await this.usersRepository.findOne({ where: { socketGame: player2ID } })
        const playersLogin: [string, string] = [UserOne.login, UserTwo.login]
        return (playersLogin);
    }

    async deleteGame(playerID: string) {
        const game: Game = await this.gameRepository.findOne({ where: { playerOneID: playerID } })
        // regarder comment verifier si le player est dans une game et la supprimer si c'est le cas
    }

}
