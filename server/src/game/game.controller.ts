import { Controller, Post, HttpCode, HttpStatus, Body, Get, Param} from '@nestjs/common';
import { GameService } from './game.service';
import { gameData } from './entities/games.entity';


@Controller('gameHistory')
export class GameController
{
    constructor(private gameHistoryService: GameService) {}

    @HttpCode(HttpStatus.OK)
    @Post('newGame')
    createNewGame(@Body() gameHistorydata: {gameData})
    {
		return this.gameService.createGame(gameData); 
    }
}