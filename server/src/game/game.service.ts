import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/games.entity';
import { GameModule } from './game.module';
import { env } from 'process';
import { User } from 'src/users/entities/users.entity';

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


    async paddleUpLeft(playerID: string)
    {
        
    }

    /**
     * devoir creer soit un GameState avec dedans paddle 1 et 2 et ball
     * ou quelque chose qui a l'air plus clean mais qu'il faut que je comprenne c'est
     * cree des class wall et ball qui me permette d'avoir de l'oriente objet et leur ft
     * 
     */
}
