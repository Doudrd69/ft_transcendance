import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEngine } from 'src/game/entities/gameEngine.entity';
import { Game } from 'src/game/entities/games.entity';
import { GameService } from 'src/game/game.service';
import { GameEngineService } from 'src/game/gameEngine.service';
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
    gameEngine: GameEngine;
    //   MatchmakingService: MatchmakingService;
    //   GameService: GameService;

    constructor(
        private readonly GameService: GameService,
        private readonly MatchmakingService: MatchmakingService,
        private readonly GameEnginceService: GameEngineService,
    ) { }

    private connectedUsers: { [userId: string]: Socket } = {};


    handleConnection(@ConnectedSocket() client: Socket, playerlogin: string) {
        console.log(`GameGtw client connected : ${client.id}`);
        this.connectedUsers[client.id] = client;
        // client.join(`user_game_${client.id}`);
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {
        console.log(`GameGtw client disconnected : ${client.id}`);
        delete this.connectedUsers[client.id];
        // client.leave(`user_game${client.id}`);
    }

    @SubscribeMessage('linkSocketWithUser')
    handleLinkSocketWithUser(client: Socket, playerLogin: string)
    {
        this.GameService.linkSocketIDWithUser(client.id, playerLogin);
    }

    @SubscribeMessage('Game')
    handleGame(@ConnectedSocket() client: Socket, data: string): void {
        this.server.emit('message', data); // Diffuse à tous les clients dans le namespace 'game'
    }

    @SubscribeMessage('join-matchmaking')
    async handleJoinMatchmaking(client: Socket, playerLogin: string): Promise<String> {
        console.log("JOINMATCHMAKING");
        this.MatchmakingService.join(client.id);
        const enoughPlayers = this.MatchmakingService.IsThereEnoughPairs();
        if (enoughPlayers) {
            const pairs: [string, string][] = await this.MatchmakingService.getPlayersPairs();
            for (const pair of pairs) {
                const socketIDs: [string, string] = [pair[0], pair[1]];
                this.game = await this.GameService.createGame(pair[0], pair[1]);

                // creer une methode qui remplis la variable UsersIDs par rapport aux pair pour l'emit 
                // const socketIDs = await getPairIDs(pair[0], pair[0]);
                this.MatchmakingService.leave(client.id);
                // this.MatchmakingService.leave(pair[1]);
                this.server.to(socketIDs).emit('joinGame', {
                        gameId: this.game.gameId,
                        playerOneID: this.game.playerOneID,
                        playerTwoID: this.game.playerTwoID,
                        scoreOne: this.game.scoreOne,
                        scoreTwo: this.game.scoreTwo,
                    });
                    this.server.to(socketIDs).emit('Game_Start', {
                        gameId: this.game.gameId,
                        playerOneID: this.game.playerOneID,
                        playerTwoID: this.game.playerTwoID,
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

    @SubscribeMessage('Game_Input')
    async handlePaddleMove(client: Socket, input: string) {
        this.gameEngine = await this.GameEnginceService.getGameEngine(client.id);
        this.GameEnginceService.game_input(input, this.gameEngine, client.id);
        this.server.to([this.gameEngine.playerOneID, this.gameEngine.playerTwoID]).emit('Game_Update', {
            BallPosition: { x: this.gameEngine.ball!.x / (16 / 9), y: this.gameEngine.ball!.y, r: this.gameEngine.ball!.r },
            paddleOne: { x: this.gameEngine.Paddles[0]!.x_pos / (16 / 9), y: this.gameEngine.Paddles[0]!.y_pos },
            paddleTwo: { x: this.gameEngine.Paddles[1]!.x_pos / (16 / 9), y: this.gameEngine.Paddles[1]!.y_pos },
            scoreOne: this.gameEngine.scoreOne,
            scoreTwo: this.gameEngine.scoreTwo,
        })
    }

    @SubscribeMessage('move-ball')
    async handleBallMove(client: Socket, game: Game) {
        // move the ball
    }
}

// apres emit juste aux deux joueurs, regarder pour le fetch et ensuite la creation des paddles et syncro de mouvement (commencer juste paddle)