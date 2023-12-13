import { Controller, Get, Post, Body, Param, Patch, Delete, BadRequestException, Logger, Request} from '@nestjs/common';
import { User } from '../users/entities/users.entity';
import { GameService } from './game.service';
import { LobbyService } from './matchmaking/matchmaking.service';

@Controller('game')
export class GameController {
  constructor(private GameService: GameService,
                private LobbyService: LobbyService) {}

  @Post('join')
  joinLobby(@Body() playerName: string) {
    console.log("player name :", playerName);
    this.LobbyService.checkLobbyAlreadyExist(playerName);
    return { message: 'Joueur rejoint avec succès', playerName };
  }
}


/*soit utiliser un guard soit utiliser un decorateur getUSer
regarder postman app
*/  