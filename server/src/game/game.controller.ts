import { Controller, Get, Post, Body, Param, Patch, Delete, BadRequestException, Logger, Request} from '@nestjs/common';
import { User } from '../users/entities/users.entity';
import { GameService } from './game.service';
import { MatchmakingService } from './matchmaking/matchmaking.service';

@Controller('game')
export class GameController {
  constructor(private GameService: GameService,
                private LobbyService: MatchmakingService) {}
}


/*soit utiliser un guard soit utiliser un decorateur getUSer
regarder postman app
*/  
