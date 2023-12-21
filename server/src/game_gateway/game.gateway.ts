import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Game } from 'src/game/entities/games.entity';
import { GameService } from 'src/game/game.service';
import { MatchmakingService } from 'src/game/matchmaking/matchmaking.service';

@WebSocketGateway({
    namespace: 'game',
    cors: {
        origin: ['http://localhost:3000']
    },
})

export class GameGateway {

    @WebSocketServer()
    server: Server;
    game: Game;
    //   MatchmakingService: MatchmakingService;
    //   GameService: GameService;

    constructor(
        private readonly GameService: GameService,
        private readonly MatchmakingService: MatchmakingService,
    ) { }

    private connectedUsers: { [userId: string]: Socket } = {};


    handleConnection(@ConnectedSocket() client: Socket) {
        console.log(`GameGtw client connected : ${client.id}`);
        this.connectedUsers[client.id] = client;
        client.join(`user_game_${client.id}`);
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {
        console.log(`GameGtw client disconnected : ${client.id}`);
        delete this.connectedUsers[client.id];
        client.leave(`user_game${client.id}`);
    }

    @SubscribeMessage('Game')
    handleGame(@ConnectedSocket() client: Socket, data: string): void {
        this.server.emit('message', data); // Diffuse à tous les clients dans le namespace 'game'
    }

    @SubscribeMessage('join-matchmaking')
    async handleJoinMatchmaking(client: Socket, playerLogin: string): Promise<String> {
        console.log("JOINMATCHMAKING");
        this.MatchmakingService.join(playerLogin);
        const enoughPlayers = this.MatchmakingService.IsThereEnoughPairs();
        if (enoughPlayers) {
            const pairs = await this.MatchmakingService.getPlayersPairs();
            for (const pair of pairs) {
                this.game = await this.GameService.createGame(pair[0], pair[1]);
                this.server.emit('joinGame', {
                    gameId: this.game.gameId,
                    playerOne: this.game.playerOne,
                    playerTwo: this.game.playerTwo,
                    scoreOne: this.game.scoreOne,
                    scoreTwo: this.game.scoreTwo,
                });

            }
        }
        return (playerLogin);
    }

    @SubscribeMessage('leave-matchmaking')
    handleLeaveMatchmaking(client: Socket, playerLogin: string): string {
        console.log("leaveMATCHMAKING");
        this.MatchmakingService.leave(playerLogin);
        return (playerLogin);
    }
}

//let i = 0; i < pairs.length; i++
// this.server.emit('players-pairs-found', pairs);