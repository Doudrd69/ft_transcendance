import { Controller, Post, HttpCode, HttpStatus, Body, Get, Param} from '@nestjs/common';
import { GameHistoryService } from './gameHistory.service';

@Controller('gameHistory')
export class GameHistoryController
{
    constructor(private gameHistoryService: GameHistoryService) {}

//     @HttpCode(HttpStatus.OK)
//     @Post('newGame')
//     createNewGame(@Body() gameHistorydata: {gameData})
//     {
// 		return this.gameHistoryService.createNewGame(gameData); 
//     }
}