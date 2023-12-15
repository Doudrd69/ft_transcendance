import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchmakingService } from './matchmaking/matchmaking.service';
import { GameService } from './game.service';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: ['http://localhost:3000']
  },
})

export class GameGateway {
  @WebSocketServer()
  server: Server;
  MatchmakingService: MatchmakingService;
  GameService: GameService;


  afterInit(server: Server) {
    console.log('GameNamespace initialized');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Game connected mama: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Game disconnected mama: ${client.id}`);
  }

  @SubscribeMessage('Game')
  handleGame(@ConnectedSocket() client: Socket, data: string): void {
    this.server.emit('message', data); // Diffuse à tous les clients dans le namespace 'game'
  }

  @SubscribeMessage('join-matchmaking')
  handleJoinMatchmaking(client: Socket, playerId: string): string {
    this.MatchmakingService.join(playerId)
    console.log("JOINMATCHMAKING");
    const enoughPlayers = this.MatchmakingService.checkPlayersPairs();
    if (enoughPlayers) {
      const pairs = this.MatchmakingService.getPlayersPairs();
      this.server.emit("players-pairs-found");
    }
    return (playerId);
  }

  @SubscribeMessage('players-pairs-found')
  async handleJoinGame(client: Socket, pairs: Array<Array<string>>) {
    // Créer une nouvelle partie pour chaque paire de joueurs
    for (const pair of pairs) {
      const gameId = await this.GameService.createGame(pair[0], pair[1]);
    }
    console.log("JOINGAME");
    return (pairs);
  }
}