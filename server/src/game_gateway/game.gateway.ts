import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from 'src/game/game.service';
import { GameEngineService } from 'src/game/gameEngine.service';
import { MatchmakingService } from 'src/game/matchmaking/matchmaking.service';
import { GatewayGuard } from 'src/gateway/Gatewayguard.guard';
import { UseGuards } from '@nestjs/common'
import { User } from 'src/users/entities/users.entity';
import dotenv from 'dotenv';
dotenv.config();

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
        origin: ['http://localhost:3000', `${process.env.SERVER_REDIRECT_URI}`]
    },
    middlewares: [GatewayGuard],
})

export class GameGateway {

    @WebSocketServer()
    server: Server;
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


    async handleException(error: Error, client: Socket) {
        console.log(`[GAME_ERROR]: ${error.stack}`)
        console.log(`[GAME_ERROR] ${error.name}, ${error.message}`)
        client.emit("exception", { error: error.message })
    }


    async handleDisconnect(@ConnectedSocket() client: Socket) {
        try {
            console.log("[handleDisconnect] ONE DISCONNECT");
            const userId: number = this.GameService.getUserIdWithSocketId(client.id);
            console.log(`[handleDisconnect] User ${userId} retrieved by socketId`)
            if (userId) {
                const user: User = await this.GameService.getUserWithUserId(userId);
                console.log(`[handleDisconnect] Retrieved disconnected user : ${user.login}`)
                if (user && await this.GameService.userInGameOrInMacthmaking(user)) {
                    if (user.inMatchmaking === true) {
                        console.log(`[handleDisconnect] User is in the matchmaking`)
                        await this.GameService.deconnectUserMatchmaking(user, userId);
                    } else {
                        let game = await this.GameService.getGameWithUserId(userId);
                        const gameInstance: game_instance = this.GameService.getGameInstance(this.game_instance, game.gameId);
                        console.log(`[handleDisconnect] User is in Game ${game.gameId}, is it ended :? ${gameInstance.game_has_ended}`)
                        if (gameInstance && gameInstance.game_has_ended !== true) {
                            console.log(`[handleDisconnect] User will be disconnect from game ${gameInstance}`)
                            if (user.login === gameInstance.playersLogin[0])
                                await this.GameService.disconnectSocket(gameInstance.usersId[0], gameInstance.gameID, gameInstance.players[0])
                            else
                                await this.GameService.disconnectSocket(gameInstance.usersId[1], gameInstance.gameID, gameInstance.players[1])
                        }
                    }
                }
            }
            console.log(`[${client.id}] GameGtw client disconnected : ${client.id}`);
        }
        catch (error) {
            await this.handleException(error, client)
        }
    }

    @SubscribeMessage('inviteAccepted')
    @UseGuards(GatewayGuard)
    async handleCheckGameInvite(@ConnectedSocket() client: Socket, @MessageBody() data: { userOneId: number, userTwoId: number, playerTwoId: string, playerOneLogin: string, playerTwoLogin: string }) {
        //     // du coup en amont il faut creer des sockets pour les deux users. si pas bon supprimer les deux sockets
        // envoyer un emit accept a lautre user
        try {
            // this.GameService.gameInvite(this.server, client, {userOneId: data.userOneId, userTwoId: data.userTwoId, playerOneId: client.id, playerTwoId: data.playerTwoId})
            console.log(`invite accpeted :=====> ${data.playerTwoId}`);
            this.server.to([data.playerTwoId]).emit('acceptInvitation');
            // if (!this.GameService.userHasAlreadyGameSockets(data.userOneId)) {
            //     if (!this.GameService.userHasAlreadyGameSockets(data.userTwoId)) {
            this.GameService.addGameInviteSocket(client.id, data.userOneId, data.playerTwoId, data.userTwoId);
            await this.GameService.linkSocketIDWithUser(client.id, data.userOneId);
            await this.GameService.linkSocketIDWithUser(data.playerTwoId, data.userTwoId);
            //             // creating a personnal room so we can emit to the user
            client.join(data.playerOneLogin);
            client.join(data.playerTwoLogin);
            let game = await this.GameService.createGame(client.id, data.playerTwoId, "NORMAL");
            if (!game)
                throw new Error("Fatal error");
            const gameInstance: game_instance = this.GameEngineceService.createGameInstance(game);
            this.game_instance.push(gameInstance);
            this.server.to([client.id, data.playerTwoId]).emit('setGameInvited');
            this.server.to([client.id, data.playerTwoId]).emit('joinGame', {
                gameId: game.gameId,
                playerOneID: game.playerOneID,
                playerTwoID: game.playerTwoID,
                playerOneLogin: game.playerOneLogin,
                playerTwoLogin: game.playerTwoLogin,
                scoreOne: game.scoreOne,
                scoreTwo: game.scoreTwo,
            });
            setTimeout(() => {
                this.server.to([client.id, data.playerTwoId]).emit('gameStart', {
                    gameId: game.gameId,
                    playerOneID: game.playerOneID,
                    playerTwoID: game.playerTwoID,
                    playerOneLogin: game.playerOneLogin,
                    playerTwoLogin: game.playerTwoLogin,
                    scoreOne: game.scoreOne,
                    scoreTwo: game.scoreTwo,
                });
            }, 1000);
            // }
            //     else {
            //         console.log(`User have already socket : ${data.playerTwoLogin}`)
            //         this.server.to([client.id, data.playerTwoId]).emit('gameInProgress');
            //     }
            // }
            // else {
            //     console.log(`User have already socket : ${data.playerOneLogin}`)
            //     this.server.to([client.id, data.playerTwoId]).emit('gameInProgress');
            // }
        }
        catch (error) {
            await this.handleException(error, client)
        }
    }

    @SubscribeMessage('linkSocketWithUser')
    @UseGuards(GatewayGuard)
    async handleLinkSocketWithUser(@ConnectedSocket() client: Socket, @MessageBody() data: { playerLogin: string, userId: number, gameMode: string }) {
        try {
            console.log(`[linkSocketWithUser]`);
            if (this.GameService.userHasAlreadyGameSockets(data.userId, client.id)) {
                this.server.to(client.id).emit('gameInProgress');
                console.log(`Game or Matchmaking In Progress for this User`);
                return;
            }
            // this.GameService.createNewGameSockets(data.userId);
            this.GameService.addGameSocket(client.id, data.userId);
            await this.GameService.linkSocketIDWithUser(client.id, data.userId);
            // creating a personnal room so we can emit to the user
            client.join(data.playerLogin);
            this.server.to(client.id).emit('gameNotInProgress', {gameMode: data.gameMode});
        }
        catch (error) {
            await this.handleException(error, client)
        }
    }

    @SubscribeMessage('throwGameInvite')
    @UseGuards(GatewayGuard)
    async handleThrowGameInvite(@ConnectedSocket() client: Socket) {
        this.GameService.addGameSocket(client.id, client.handshake.auth.user.sub);
    }

    @SubscribeMessage('gameInviteRejected')
    @UseGuards(GatewayGuard)
    handleGameInviteRejected(@ConnectedSocket() client: Socket) {
        this.GameService.deleteGameSocketsIdForPlayer(client.handshake.auth.user.sub);
    }

    @SubscribeMessage('Game')
    @UseGuards(GatewayGuard)
    async handleGame(@ConnectedSocket() client: Socket, data: string) {
        try {
            this.server.emit('message', data); // Diffuse à tous les clients dans le namespace 'game'
        }
        catch (error) {
            await this.handleException(error, client)
        }
    }

    @SubscribeMessage('join-matchmaking')
    @UseGuards(GatewayGuard)
    async handleJoinMatchmaking(@ConnectedSocket() client: Socket, @MessageBody() data: { playerLogin: string, gameMode: string, userId: number }) {
        try {
            console.log(`== ${data.playerLogin}, userID= ${data.userId} JOINS MATCHMAKING ==`);
            console.log(`gameMode ==== ${data.gameMode}`);
            await this.MatchmakingService.joinQueue(client.id, data.userId, data.gameMode);
            const enoughPlayers = await this.MatchmakingService.IsThereEnoughPairs(data.gameMode);

            console.log("Ready to start: ", enoughPlayers);
            if (enoughPlayers) {
                const pairs: [string, string][] = await this.MatchmakingService.getPlayersPairsQueue(data.gameMode);
                for (const pair of pairs) {
                    const socketIDs: [string, string] = [pair[0], pair[1]];
                    let game = await this.GameService.createGame(pair[0], pair[1], data.gameMode);
                    if (!game)
                        throw new Error("Fatal error");
                    const gameInstance: game_instance = this.GameEngineceService.createGameInstance(game);
                    this.game_instance.push(gameInstance);
                    await this.MatchmakingService.leaveQueue(pair[0], data.gameMode, gameInstance.usersId[0]);
                    await this.MatchmakingService.leaveQueue(pair[1], data.gameMode, gameInstance.usersId[1]);
                    console.log("SOCKET IDs: ", socketIDs);
                    this.server.to(socketIDs).emit('setgame');
                    this.server.to(socketIDs).emit('joinGame', {
                        gameId: game.gameId,
                        playerOneID: game.playerOneID,
                        playerTwoID: game.playerTwoID,
                        playerOneLogin: game.playerOneLogin,
                        playerTwoLogin: game.playerTwoLogin,
                        scoreOne: game.scoreOne,
                        scoreTwo: game.scoreTwo,
                    });
                    setTimeout(() => {
                        this.server.to(socketIDs).emit('gameStart', {
                            gameId: game.gameId,
                            playerOneID: game.playerOneID,
                            playerTwoID: game.playerTwoID,
                            playerOneLogin: game.playerOneLogin,
                            playerTwoLogin: game.playerTwoLogin,
                            scoreOne: game.scoreOne,
                            scoreTwo: game.scoreTwo,
                        });
                    }, 1000);
                }
            }
        }
        catch (error) {
            await this.handleException(error, client)
        }
    }

    @SubscribeMessage('playerJoined')
    @UseGuards(GatewayGuard)
    async handleStartGame(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: number }) {
        try {
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
        catch (error) {
            await this.handleException(error, client)
        }
    }

    async endGame(gameInstance: game_instance, gameLoop: NodeJS.Timeout) {
        gameInstance.stop = true
        clearInterval(gameLoop);
        // const user: User = await this.GameService.
        this.server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GameEnd')
        const user1: User = await this.GameService.getUserWithUserId(gameInstance.usersId[0]);
        const user2: User = await this.GameService.getUserWithUserId(gameInstance.usersId[1]);
        await this.GameService.updateStateGameForUsers(user1, user2);
        this.GameService.deleteGameSocketsIdForPlayers(user1, user2);
        let game = await this.GameService.getGameWithGameId(gameInstance.gameID);
        console.log(`[endGame] score: ${gameInstance.player1_score}, ${gameInstance.player2_score}, game.gameEnd = ${game.gameEnd}, game.id = ${game.gameId}`)
        if (game.gameEnd === false) {
            console.log(`[endGame] gameEnd is false ${gameInstance.player1_score}, ${gameInstance.player2_score}`)
            await this.GameService.endOfGame(game, gameInstance);
        }
    }


    async handleUserDisconnection(disconnectedSockets: string[], gameInstance: game_instance, gameLoop: NodeJS.Timeout) {
        console.log(`[handleUserDisconnection]: ${disconnectedSockets} `)
        try {
            gameInstance.stop = true
            clearInterval(gameLoop);
            const user1: User = await this.GameService.getUserWithUserId(gameInstance.usersId[0]);
            const user2: User = await this.GameService.getUserWithUserId(gameInstance.usersId[1]);
            let game = await this.GameService.getGameWithUserId(user1.id);
            await this.GameService.deleteGame(game);
            await this.GameService.createGameStop(user1, user2, gameInstance, disconnectedSockets);
            await this.GameService.updateStateGameForUsers(user1, user2);
            
            this.server.to([gameInstance.players[0], gameInstance.players[1]]).emit('userDisconnected');
            await this.GameService.clearDisconnections(gameInstance.gameID);
            this.GameService.deleteGameSocketsIdForPlayers(user1, user2);
            // delete gameInstance
        } catch (error) {
            console.log(error.stack)
            console.log("User disconnection handling failed")
        }
    }

    async executeGameTick(gameLoop: NodeJS.Timeout, gameInstance: game_instance, client: string) {
        try {
            if (gameInstance.stop === true) {
                console.log(`[RETURN GAME STOP] gameinstance: ${gameInstance.game_has_ended}`)
                return
            }
            const disconnectedSockets = this.GameService.getDisconnections(gameInstance.gameID)
            if (disconnectedSockets.length > 0)
                await this.handleUserDisconnection(disconnectedSockets, gameInstance, gameLoop)
            if (gameInstance.game_has_ended === true)
                await this.endGame(gameInstance, gameLoop)
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
                paddleOne: { x: gameInstance.paddles[0].start.x - 0.025, y: gameInstance.paddles[0].start.y, width: 0.025, height: gameInstance.paddles[0].end.y - gameInstance.paddles[0].start.y },
                paddleTwo: { x: gameInstance.paddles[1].start.x, y: gameInstance.paddles[1].start.y, width: 0.025, height: gameInstance.paddles[1].end.y - gameInstance.paddles[1].start.y },
            })
        } catch (error) {
            console.log(`[GAME_LOOP_ERROR]: ${error.stack}`)
            console.log(`[GAME_LOOP_ERROR]: ${error.name}, ${error.message}`)
            const user1: User = await this.GameService.getUserWithUserId(gameInstance.usersId[0]);
            const user2: User = await this.GameService.getUserWithUserId(gameInstance.usersId[1]);
            await this.GameService.disconnectSocket(gameInstance.usersId[0], gameInstance.gameID, gameInstance.players[0])
            await this.GameService.disconnectSocket(gameInstance.usersId[1], gameInstance.gameID, gameInstance.players[0])
            await this.handleUserDisconnection(
                [gameInstance.players[0], gameInstance.players[1]], gameInstance, gameLoop
            )
        }
    }

    @SubscribeMessage('leave-matchmaking')
    @UseGuards(GatewayGuard)
    async handleLeaveMatchmaking(@ConnectedSocket() client: Socket, @MessageBody() data: { playerLogin: string, userId: number }) {
        try {
            console.log("emit leave-matchmaking :", client.id);
            const user: User = await this.GameService.getUserWithUserId(data.userId);
            if (user.inSpeedQueue === true)
                this.MatchmakingService.leaveQueue(client.id, "SPEED", data.userId);
            else {
                this.MatchmakingService.leaveQueue(client.id, "NORMAL", data.userId);
            }
            // this.GameService.deleteGameSocketsIdForPlayer(data.userId);
            this.server.to(client.id).emit('leave-game');
        }
        catch (error) {
            await this.handleException(error, client)
        }
    }

    @SubscribeMessage('gameInputDown')
    @UseGuards(GatewayGuard)
    async handlePaddleMove(@ConnectedSocket() client: Socket, @MessageBody() data: { input: string, gameID: number }) {
        try {
            const gameInstance: game_instance = this.GameService.getGameInstance(this.game_instance, data.gameID);
            if (gameInstance) {
                if (gameInstance.pause !== true) {
                    this.GameEngineceService.switchInputDown(data.input, gameInstance, client.id);
                }
            }
        }
        catch (error) {
            await this.handleException(error, client)
        }
    }

    @SubscribeMessage('gameInputUp')
    @UseGuards(GatewayGuard)
    async handlePaddleStop(@ConnectedSocket() client: Socket, @MessageBody() data: { input: string, gameID: number }) {
        try {
            const gameInstance: game_instance = this.GameService.getGameInstance(this.game_instance, data.gameID);
            if (gameInstance) {
                this.GameEngineceService.switchInputUp(data.input, gameInstance, client.id);
            }
        }
        catch (error) {
            await this.handleException(error, client)
        }
    }
}

/** Liste des choses a faire :
 * 
 * Try and catch tout les retour d'await et voir avec gael
 * 
 * 
 * 
 */