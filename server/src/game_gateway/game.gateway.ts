import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody } from '@nestjs/websockets';
// import { use } from 'react';
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
import { ExecutionContext } from '@nestjs/common';
import { User } from 'src/users/entities/users.entity';
import { on } from 'events';

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
    stop: boolean;
    usersId: number[];
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

    async handleConnection(@ConnectedSocket() client: Socket) {
        console.log(`GameGtw client connected : ${client.id}`);
    }

    async handleDisconnect(@ConnectedSocket() client: Socket) {
        try {
            const userId: number = this.GameService.getUserIdWithSocketId(client.id);
            // console.log(`[${client.id}] userLogin de ses morts 1: ${userLogin}`);
            if (userId) {
                console.log("disconect USER NOW")
                console.log(`userId = ${userId}`)
                const user: User = await this.GameService.getUserWithUserId(userId);
                if (user && this.GameService.userInGameOrInMacthmaking(user)) {
                    if (user.inMatchmaking === true) {
                        await this.GameService.deconnectUserMatchmaking(user, userId);
                    }
                    else {
                        this.game = await this.GameService.getGameWithUserId(userId);
                        const gameInstance: game_instance = this.GameService.getGameInstance(this.game_instance, this.game.gameId);
                        if (gameInstance && gameInstance.game_has_ended !== true) {
                            if (user.login === gameInstance.playersLogin[0])
                                this.GameService.disconnectSocket(gameInstance.players[1], gameInstance.gameID)
                            else
                                this.GameService.disconnectSocket(gameInstance.players[0], gameInstance.gameID)
                        }
                    }
                }
            }
        }
        catch (err) {
            console.log(client.id)
            throw (err)
        }
        console.log(`[${client.id}] GameGtw client disconnected : ${client.id}`);
    }

    @SubscribeMessage('inviteAccepted')
    async handleCheckgameInvite(@ConnectedSocket() client: Socket, @MessageBody() data: { userOneId: number, userTwoId: number, playerTwoId: string, playerOneLogin: string, playerTwoLogin: string}) {
        //     // du coup en amont il faut creer des sockets pour les deux users. si pas bon supprimer les deux sockets
        // envoyer un emit accept a lautre user
        console.log(`check : id : ${client.id}, ${data.playerTwoId} ${data.userOneId} ${data.userTwoId} playerOneLogin: string, playerTwoLogin: string`)
        this.server.to([data.playerTwoId]).emit('acceptInvitation');
        if (!this.GameService.userHasAlreadyGameSockets(data.userOneId)) {
            if (!this.GameService.userHasAlreadyGameSockets(data.userTwoId)) {
                this.GameService.addGameInviteSocket(client.id, data.userOneId, data.playerTwoId, data.userTwoId);
                await this.GameService.linkSocketIDWithUser(client.id, data.userOneId);
                await this.GameService.linkSocketIDWithUser(data.playerTwoId, data.userTwoId);
                //             // creating a personnal room so we can emit to the user
                client.join(data.playerOneLogin);
                client.join(data.playerTwoLogin);
                this.game = await this.GameService.createGame(client.id, data.playerTwoId, "NORMAL");
                const gameInstance: game_instance = this.GameEngineceService.createGameInstance(this.game);
                this.game_instance.push(gameInstance);
                this.server.to([client.id, data.playerTwoId]).emit('setgame');
                this.server.to([client.id, data.playerTwoId]).emit('joinGame', {
                    gameId: this.game.gameId,
                    playerOneID: this.game.playerOneID,
                    playerTwoID: this.game.playerTwoID,
                    playerOneLogin: this.game.playerOneLogin,
                    playerTwoLogin: this.game.playerTwoLogin,
                    scoreOne: this.game.scoreOne,
                    scoreTwo: this.game.scoreTwo,
                });
                setTimeout(() => {
                    this.server.to([client.id, data.playerTwoId]).emit('gameStart', {
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
            else {
                this.server.to([client.id, data.playerTwoId]).emit('gameInProgress');
            }
        }
        else {
            this.server.to([client.id, data.playerTwoId]).emit('gameInProgress');
        }
    }

    @SubscribeMessage('linkSocketWithUser')
    @UseGuards(GatewayGuard)
    async handleLinkSocketWithUser(@ConnectedSocket() client: Socket, @MessageBody() data: { playerLogin: string, userId: number}) {
        console.log(`linkUserCheck`);
        if (this.GameService.userHasAlreadyGameSockets(data.userId)) {
            this.server.to(client.id).emit('gameInProgress');
            console.log(`Game or Matchmaking In Progress, InMatchmaking: {mettre le inMatchmaking}, InGame: {mettre le Ingame}`);
            return;
        }
        this.GameService.createNewGameSockets(data.userId);
        this.GameService.addGameSocket(client.id, data.userId);
        await this.GameService.linkSocketIDWithUser(client.id, data.userId);
        console.log(`Link OK --> joining personnal room: ${client.id}`);
        // creating a personnal room so we can emit to the user
        client.join(data.playerLogin);
        this.server.to(client.id).emit('gameNotInProgress');
    }

    @SubscribeMessage('Game')
    @UseGuards(GatewayGuard)
    handleGame(@ConnectedSocket() client: Socket, data: string): void {
        this.server.emit('message', data); // Diffuse à tous les clients dans le namespace 'game'
    }

    @SubscribeMessage('join-matchmaking')
    @UseGuards(GatewayGuard)
    async handleJoinMatchmaking(@ConnectedSocket() client: Socket, @MessageBody() data: { playerLogin: string, gameMode: string, userId: number}) {
        console.log(`== ${data.playerLogin} JOINS MATCHMAKING ==`);
        console.log(`gameMode ==== ${data.gameMode}`);
        await this.MatchmakingService.joinQueue(client.id, data.userId, data.gameMode);
        const enoughPlayers = await this.MatchmakingService.IsThereEnoughPairs(data.gameMode);

        console.log("Ready to start: ", enoughPlayers);
        if (enoughPlayers) {
            const pairs: [string, string][] = await this.MatchmakingService.getPlayersPairsQueue(data.gameMode);
            for (const pair of pairs) {
                const socketIDs: [string, string] = [pair[0], pair[1]];
                this.game = await this.GameService.createGame(pair[0], pair[1], data.gameMode);
                if (!this.game)
                    throw new Error("Fatal error");
                const gameInstance: game_instance = this.GameEngineceService.createGameInstance(this.game);
                this.game_instance.push(gameInstance);
                if (data.gameMode === "NORMAL") {
                    this.MatchmakingService.leaveQueue(pair[0], data.gameMode);
                    this.MatchmakingService.leaveQueue(pair[1], data.gameMode);
                }
                if (data.gameMode === "SPEED") {
                    this.MatchmakingService.leaveQueue(pair[0], data.gameMode);
                    this.MatchmakingService.leaveQueue(pair[1], data.gameMode);
                }
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
                this.GameService.setUpDisconnection(gameInstance.gameID);
                setTimeout(() => {
                    this.server.to([gameInstance.players[0], gameInstance.players[1]]).emit('startGameLoop');
                    const gameLoop = setInterval(() => {
                        this.executeGameTick(gameLoop, gameInstance, client.id)
                    }, 16)
                }, 3000);
            }
        }
    }

    async executeGameTick(gameLoop: NodeJS.Timeout, gameInstance: game_instance, client: string) {
        if (gameInstance.stop === true)
            return
        const disconnectedSockets = this.GameService.getDisconnections(gameInstance.gameID)
        if (disconnectedSockets.length > 0) {
            console.log(`disconnectedFound: ${disconnectedSockets} `)
            gameInstance.stop = true
            clearInterval(gameLoop);
            for (const userSocket of disconnectedSockets) {
                this.server.to(userSocket).emit('userDisconnected');
            }
            const user1: User = await this.GameService.getUserWithUserId(gameInstance.usersId[0]);
            const user2: User = await this.GameService.getUserWithUserId(gameInstance.usersId[1]);
            await this.GameService.updateStateGameForUsers(user1, user2);
            this.GameService.deleteGameSocketsIdForPlayers(user1, user2);
            await this.GameService.deleteGame(this.game);
            this.GameService.clearDisconnections(gameInstance.gameID);
            // delete gameInstance
        }
        if (gameInstance.game_has_ended === true) {
            gameInstance.stop = true
            clearInterval(gameLoop);
            // const user: User = await this.GameService.
            this.server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GameEnd')
            const user1: User = await this.GameService.getUserWithUserId(gameInstance.usersId[0]);
            console.log(`CACA`);
            const user2: User = await this.GameService.getUserWithUserId(gameInstance.usersId[1]);
            await this.GameService.updateStateGameForUsers(user1, user2);
            this.GameService.deleteGameSocketsIdForPlayers(user1, user2);
            if (this.game.gameEnd === false) {
                await this.GameService.endOfGame(this.game, gameInstance);
            }
        }
        // if (gameInstance.stop === true) {
        //     clearInterval(gameLoop);
        //     // enlever la gameInstance 
        // }

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
    async handleLeaveMatchmaking(@ConnectedSocket() client: Socket, @MessageBody() data: { playerLogin: string , userId: number}) {
        console.log("emit leave-matchmaking");
        this.MatchmakingService.leaveQueue(client.id, "SPEED");
        this.MatchmakingService.leaveQueue(client.id, "NORMAL");
        this.GameService.deleteGameSocketsIdForPlayer(data.userId);
        this.server.to(client.id).emit('leave-game');
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
 * faire les game invites
 * {
 *      creer un socket aux deux users et verif avec les toats pour emit avec l'un userId de l'autre t son login de lautre et son login a soi meme
 * }
 * faire le front du jeu
 * {
 *      voir ce que je peux faire comme :
 *          -message a la fin de la game
 *          -message au depart d'un player
 *          -message si Game in progress ou Matchmaking in progress
 *          -debut de game moins chaotique
 * }
 * casser le jeu pour debug
 * essayer d'ameliorer les collisions (avec gael)
 * 
 * 
 * DEBUG: probleme userId quand stop game
 */