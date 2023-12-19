import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/games.entity';
import { GameModule } from './game.module';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
        private gameRepository: Repository<Game>,
  ) {}

  async createGame(player1: string, player2: string) {

    const game = new Game();
	console.log("New Game Create");
    game.playerOne = player1;
	game.playerTwo = player2;
	game.scoreOne = 0;
	game.scoreTwo = 0;

    // Enregistrer la partie dans le repository
    await this.gameRepository.save(game);
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