import { Injectable } from '@nestjs/common';
import { User } from '../../users/entities/users.entity';

@Injectable()
export class MatchmakingService {
  private waitingPlayers: User[] = [];

  addPlayerToQueue(player: User): void {
    this.waitingPlayers.push(player);
  }

  matchPlayers(): [User, User] | null {
    if (this.waitingPlayers.length >= 2) {
      const player1 = this.waitingPlayers.shift();
      const player2 = this.waitingPlayers.shift();
      return [player1, player2];
    }
    return null;
  }
}

/*
je dois recuperer le nom d'un User et utiliser la ft d'edouard pour recuperer un User
depuis un login, je compare ensuite les Users par leur login et je garde les infos pour les donner
au back et front pour les donnees du jeu

donc regarder comment recuperer le login dans le front et ensuite comment l'envoyer au back

alors a priori, dans le front j'arriverai a avoir le User grace aux socket ID, si c'est le cas je dois attendre qu'il soit fait
apres je peux essayer d'en creer une mini pour test ce que je veux faire? 
de plus est ce que je dois vraiment utiliser leurs sockets? a quoi me servent mes Sockets.ID ?
si je les trouvent avec leurs socket je dois faire une copie pour les rajouter a mes sockets pour ensuite faire
le partage de connexion etc?

questions a poser a gawel et antoinette


connction avec 2 pages privee et voir comment recup le User depuis le front
*/