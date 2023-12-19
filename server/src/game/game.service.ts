import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
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
    // Créer une nouvelle partie
    const game = new Game();
    // game.players = [player1, player2];

    // Enregistrer la partie dans le repository
    // await this.gameRepository.save(game);

    // Retourner l'ID de la partie
    return game.id;
  }
}