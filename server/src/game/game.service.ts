import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/games.entity';
import { GameModule } from './game.module';
import { env } from 'process';
import { User } from 'src/users/entities/users.entity';

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

}


/**
 * async createGame(players: [string, string]) {

    const game = new Game();
    console.log("New Game Create");
    game.playerOne = players[0];
    game.playerTwo = players[1];

    // Enregistrer la partie dans le repository
    await this.gameRepository.save(game);

    return game.id;
  }
 */