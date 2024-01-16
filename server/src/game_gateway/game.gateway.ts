import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEngine } from 'src/game/entities/gameEngine.entity';
import { Game } from 'src/game/entities/games.entity';
import { Paddle } from 'src/game/entities/paddle.entity';
import { GameService } from 'src/game/game.service';
import { GameEngineService } from 'src/game/gameEngine.service';
import { BallService } from 'src/game/gameObject/ball.service';
import { PaddleService } from 'src/game/gameObject/paddle.service';
import { MatchmakingService } from 'src/game/matchmaking/matchmaking.service';

export interface vector_instance {
    x: number;
    y: number;
}

export interface ball_instance {
    position: vector_instance;
    speed: vector_instance;
    r: number;
    alive: boolean;
    elasticity: number;

}

export interface paddle_instance {
    x: number;
    y: number;
    speed: number;
    up: boolean;
    down: boolean;
    is_a_paddle: boolean;
    length: number;
    start: vector_instance;
    end: vector_instance;
}

export interface Game_instance {
    gameID: number;
    playersLogin: string[];
    player1_score: number;
    player2_score: number;
    game_has_started: boolean;
    super_game_mode: boolean;
    players: string[];
    game_has_ended: boolean;
    ball: ball_instance;
    paddles: paddle_instance[];
    victory_condition: number;
}

let gameInstance: Game_instance | null = null;
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
    paddle: Paddle;
    game_instance: Game_instance[];
    //   MatchmakingService: MatchmakingService;
    //   GameService: GameService;

    constructor(
        private readonly GameService: GameService,
        private readonly MatchmakingService: MatchmakingService,
        private readonly GameEnginceService: GameEngineService,
        private readonly PaddleService: PaddleService,
        private readonly BallService: BallService,
    ) {
        this.game_instance = [];
    }

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
    handleLinkSocketWithUser(client: Socket, playerLogin: string) {
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
                this.gameEngine = await this.GameEnginceService.createGameEngine(pair[0], pair[1]);
                const gameInstance: Game_instance = this.GameEnginceService.createGameInstance(this.game);
                this.game_instance.push(gameInstance);
                this.MatchmakingService.leave(pair[0]);
                this.MatchmakingService.leave(pair[1]);
                this.server.to(socketIDs).emit('joinGame', {
                    gameId: this.game.gameId,
                    playerOneID: this.game.playerOneID,
                    playerTwoID: this.game.playerTwoID,
                    playerOneLogin: this.game.playerOneLogin,
                    playerTwoLogin: this.game.playerTwoLogin,
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
    handleLeaveMatchmaking(@ConnectedSocket() client: Socket, playerLogin: string): string {
        console.log("leaveMATCHMAKING");
        this.MatchmakingService.leave(playerLogin);
        return (playerLogin);
    }

    @SubscribeMessage('GameWidthHeigth')
    handleGameWidthHeigth(@ConnectedSocket() client: Socket, @MessageBody() data: { gameID: number, gameWidth: number, gameHeigth: number }) {

    }

    @SubscribeMessage('Game_Input')
    async handlePaddleMove(@ConnectedSocket() client: Socket, @MessageBody() data: { input: string, gameID: number }) {
        for (let i = 0; i < this.game_instance.length; i++) {
            gameInstance = this.game_instance[i];
            if (gameInstance.gameID === data.gameID) {
                // console.log("==");
                // console.log(`pgameID === ${gameInstance.gameID}`);
                // console.log(`pgameID2 === ${data.gameID}`);
                // console.log("==");
                this.GameEnginceService.game_input(data.input, gameInstance, client.id);
                this.server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GamePaddleUpdate', {
                    paddleOne: { x: gameInstance.paddles[0].x / (16 / 9), y: gameInstance.paddles[0].y },
                    paddleTwo: { x: gameInstance.paddles[1].x / (16 / 9), y: gameInstance.paddles[1].y },
                })
                break;
            }
        }
    }

    @SubscribeMessage('GameBackUpdate')
    async handleGameUpdate(client: Socket, @MessageBody() data: { gameID: number }) {
        for (let i = 0; i < this.game_instance.length; i++) {
            gameInstance = this.game_instance[i];
            if (gameInstance.gameID === data.gameID) {
                // console.log("==");
                // console.log(`bgameID === ${gameInstance.gameID}`);
                // console.log(`bgameID2 === ${data.gameID}`);
                // console.log("==");
                this.GameEnginceService.updateGameEngine(gameInstance);
                console.log(`ball y position : ${gameInstance.ball.position.y}`);
                this.server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GameBallUpdate', {
                    BallPosition: { x: gameInstance.ball.position.x / (16 / 9), y: gameInstance.ball.position.y },
                    scoreOne: gameInstance.player1_score,
                    scoreTwo: gameInstance.player2_score,
                })
                break;
            }
        }
    }
}
