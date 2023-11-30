import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lobby } from './entities/lobby.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Lobby]),
  ],
  controllers: [GameController],
  providers: [GameGateway, GameService],
  exports: [GameService],
})
export class GameModule {}

/* en gros, ce que je ne comprends pas c'est que j'ai cree un service de matchmaking 
pas comment l'utiliser, faudrait que j'arrive a comprendre qui sont mes utilisateurs
je dois prendre ceux de l'auth?
je dois aussi comprendre comment relier mon service de matchmaking au front avec mon bouton play
ensuite il y a aussi le faite de creer une room?
le fait de partager les postions des paddles et balle
Donc deja comment relier le backend au front?
*/
