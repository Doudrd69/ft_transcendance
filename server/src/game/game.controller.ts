import { Controller, Get, Post, Body, Param, Patch, Delete, BadRequestException, Logger, Request} from '@nestjs/common';
import { User } from '../users/entities/users.entity';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private GameService: GameService) {}

  @Post('join')
  joinGame(@Body() player: User) {
    return { message: 'Joueur rejoint avec succès', playerName: User.name };
  }
}


/*soit utiliser un guard soit utiliser un decorateur getUSer
regarder postman app
*/