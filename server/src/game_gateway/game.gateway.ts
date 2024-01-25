import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Game } from 'src/game/entities/games.entity';
import { Paddle } from 'src/game/entities/paddle.entity';
import { GameService } from 'src/game/game.service';
import { GameEngineService } from 'src/game/gameEngine.service';
import { BallService } from 'src/game/gameObject/ball.service';
import { PaddleService } from 'src/game/gameObject/paddle.service';
import { MatchmakingService } from 'src/game/matchmaking/matchmaking.service';
import { GatewayGuard } from 'src/gateway/Gatewayguard.guard';
import { UseGuards } from '@nestjs/common'

export interface vector_instance {
    x: number;
    y: number;
}

// export interface key_instance {
//     up: boolean;
//     down: boolean;
// }

export interface ball_instance {
    position: vector_instance;
    speed: vector_instance;
    r: number;
    alive: boolean;
    elasticity: number;
    player1Scored: boolean;
    player2Scored: boolean;
}

export interface paddle_instance {
    speed: number;
    ArrowUp: boolean;
    ArrowDown: boolean;
    is_a_paddle: boolean;
    length: number;
    start: vector_instance;
    end: vector_instance;
    number: number;
}

export interface game_instance {
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
    player1Joined: boolean;
    player2Joined: boolean;
    pause: boolean;
}

let gameInstance: game_instance | null = null;
@WebSocketGateway({
    namespace: 'game',
    cors: {
        origin: ['http://localhost:3000']
    },
    middlewares: [GatewayGuard],
})


export class GameGateway {

    @WebSocketServer()
    server: Server;
    game: Game;
    paddle: Paddle;
    game_instance: game_instance[];

    constructor(
        private readonly GameService: GameService,
        private readonly MatchmakingService: MatchmakingService,
        private readonly GameEngineceService: GameEngineService,
    ) {
        this.game_instance = [];
    }

    private connectedUsers: { [userId: string]: Socket } = {};


    handleConnection(@ConnectedSocket() client: Socket) {
        console.log(`GameGtw client connected : ${client.id}`);
        this.connectedUsers[client.id] = client;
        // client.join(`user_game_${client.id}`);
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {
        console.log(`GameGtw client disconnected : ${client.id}`);
        //faire un inmatchmaking fasle et ingamefalse, faire de meme avec le ingame de l'autre joueur (faire un emit pour quitter le jeu)
        delete this.connectedUsers[client.id];
        // client.leave(`user_game${client.id}`);
    }

    @SubscribeMessage('linkSocketWithUser')
    @UseGuards(GatewayGuard)
    handleLinkSocketWithUser(client: Socket, playerLogin: string) {
        console.log("Linking socket to user ", playerLogin);
        this.GameService.linkSocketIDWithUser(client.id, playerLogin);
        console.log("Link OK --> joining personnal room");
        // creating a personnal room so we can emit to the user
        client.join(playerLogin);
        this.server.to(playerLogin).emit('connectionDone');
    }

    @SubscribeMessage('Game')
    @UseGuards(GatewayGuard)
    handleGame(@ConnectedSocket() client: Socket, data: string): void {
        this.server.emit('message', data); // Diffuse à tous les clients dans le namespace 'game'
    }

    @SubscribeMessage('join-matchmaking')
    @UseGuards(GatewayGuard)
    async handleJoinMatchmaking(@ConnectedSocket() client: Socket, @MessageBody() data: { playerLogin: string}) {
        const { playerLogin } = data;
        console.log(`== ${playerLogin} JOINS MATCHMAKING ==`);
 
        this.MatchmakingService.join(client.id);
        const enoughPlayers = await this.MatchmakingService.IsThereEnoughPairs();

        console.log("Ready to start: ", enoughPlayers);
        if (enoughPlayers) {
            const pairs: [string, string][] = await this.MatchmakingService.getPlayersPairs();
            for (const pair of pairs) {
                const socketIDs: [string, string] = [pair[0], pair[1]];
                this.game = await this.GameService.createGame(pair[0], pair[1]);
                if (!this.game)
                    throw new Error("Fatal error");
                const gameInstance: game_instance = this.GameEngineceService.createGameInstance(this.game);
                this.game_instance.push(gameInstance);
                this.MatchmakingService.leave(pair[0]);
                this.MatchmakingService.leave(pair[1]);
                console.log("SOCKET IDs: ", socketIDs);
                this.server.to(socketIDs).emit('setgame');
                this.server.to(socketIDs).emit('joinGame', {
                    gameId: this.game.gameId,
                    playerOneID: this.game.playerOneID,
                    playerTwoID: this.game.playerTwoID,
                    playerOneLogin: this.game.playerOneLogin,
                    playerTwoLogin: this.game.playerTwoLogin,
                    scoreOne: this.game.scoreOne,
                    scoreTwo: this.game.scoreTwo,
                });
                setTimeout(() => {
                    this.server.to(socketIDs).emit('gameStart', {
                        gameId: this.game.gameId,
                        playerOneID: this.game.playerOneID,
                        playerTwoID: this.game.playerTwoID,
                        playerOneLogin: this.game.playerOneLogin,
                        playerTwoLogin: this.game.playerTwoLogin,
                        scoreOne: this.game.scoreOne,
                        scoreTwo: this.game.scoreTwo,
                    });
                }, 1000);
            }
        }
    }

    @SubscribeMessage('playerJoined')
    @UseGuards(GatewayGuard)
    async handleStartGame(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: number }) {
        const gameInstance: game_instance = this.GameService.getGameInstance(this.game_instance, data.gameId);
        if (gameInstance) {
            this.GameService.playerJoined(client.id, gameInstance)
            if (this.GameService.everyPlayersJoined(gameInstance)) {
                setTimeout(() => {
                    const gameLoop = setInterval(() => {
                        this.executeGameTick(gameLoop, gameInstance, client.id)
                    }, 16)
                }, 3000);
            }
        }
    }

    async executeGameTick(gameLoop: NodeJS.Timeout, gameInstance: game_instance, client: string) {
        if (gameInstance.game_has_ended === true) {
            clearInterval(gameLoop);
            if (this.game.gameEnd !== true && client == gameInstance.players[0]) {
                await this.GameService.endOfGame(this.game, gameInstance);
                console.log("Game Save");
            }
        }
        this.GameEngineceService.processInput(gameInstance);
        this.GameEngineceService.updateGameInstance(gameInstance, this.server);
        this.server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GameUpdate', {
            BallPosition: { x: gameInstance.ball.position.x, y: gameInstance.ball.position.y },
            scoreOne: gameInstance.player1_score,
            scoreTwo: gameInstance.player2_score,
            paddleOne: { x: gameInstance.paddles[0].start.x - 0.025, y: gameInstance.paddles[0].start.y },
            paddleTwo: { x: gameInstance.paddles[1].start.x, y: gameInstance.paddles[1].start.y },
        })
    }

    @SubscribeMessage('leave-matchmaking')
    @UseGuards(GatewayGuard)
    async handleLeaveMatchmaking(@ConnectedSocket() client: Socket, @MessageBody() data: { playerLogin: string }) {
        const { playerLogin } = data;
        console.log(`== Client ${client.id} (${playerLogin}) left (queue) matchmaking ==`);
        await this.MatchmakingService.leave(playerLogin);
        console.log("emit leave-game");
        this.server.to(playerLogin).emit('leave-game');
    }

    @SubscribeMessage('gameInputDown')
    @UseGuards(GatewayGuard)
    async handlePaddleMove(@ConnectedSocket() client: Socket, @MessageBody() data: { input: string, gameID: number }) {
        const gameInstance: game_instance = this.GameService.getGameInstance(this.game_instance, data.gameID);
        if (gameInstance) {
            if (gameInstance.pause !== true) {
                this.GameEngineceService.switchInputDown(data.input, gameInstance, client.id);
            }
        }
    }

    @SubscribeMessage('gameInputUp')
    @UseGuards(GatewayGuard)
    async handlePaddleStop(@ConnectedSocket() client: Socket, @MessageBody() data: { input: string, gameID: number }) {
        const gameInstance: game_instance = this.GameService.getGameInstance(this.game_instance, data.gameID);
        if (gameInstance) {
            this.GameEngineceService.switchInputUp(data.input, gameInstance, client.id);
        }

    }
}

/** Liste des choses a faire :
 * remettre les reset de game
 * mettre en place les inGame et les inMatchmaking
 * gerer les disconnects et les fins de game
 * voir pour les multi sockets
 * essayer d'ameliorer les collisions/ speed (avec gael)
 * creer un game mode
 * faire les game invites
 * regarder ce que je peux enlever du front pour le mettre dans le back
 * faire le front du jeu
 * casser le jeu pour debug
 */