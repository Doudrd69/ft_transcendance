import { Controller, Get, Post, Body, Param, Patch, Delete, BadRequestException, Logger, Request} from '@nestjs/common';
import { User } from '../users/entities/users.entity';
import { MatchmakingService } from './matchmaking/matchmaking.service';

@Controller('game')
export class GameController {
  constructor(private matchmakingService: MatchmakingService) {}

  @Post('join')
  joinGame(player: User) {
    this.matchmakingService.addPlayerToQueue(player);
  }
}
