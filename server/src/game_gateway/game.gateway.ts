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


    async handleConnection(@ConnectedSocket() client: Socket) {
        console.log(`GameGtw client connected : ${client.id}`);
        this.connectedUsers[client.id] = client;
    }

    async handleDisconnect(@ConnectedSocket() client: Socket) {
        try {
            // this.game_instance.deconnections.push(current_deconnection)
            const userLogin = this.GameService.getUserLoginWithSocketId(client.id);
            console.log(`[${client.id}] userLogin de ses morts 1: ${userLogin}`);
            if (userLogin) {
                const user: User = await this.GameService.getUserWithUserLogin(userLogin);
                if (this.GameService.userInGameOrInMacthmaking(user)) {
                    if (user.inMatchmaking === true) {
                        await this.MatchmakingService.leaveNormalQueue(client.id);
                        await this.GameService.deconnectUserMatchmaking(user, userLogin);
                    }
                    else {
                        console.log(`[${client.id}] userLogin de ses morts 2: ${userLogin}`);
                        this.game = await this.GameService.getGameWithUserLogin(userLogin);
                        const gameInstance: game_instance = this.GameService.getGameInstance(this.game_instance, this.game.gameId);
                        console.log(`[${client.id}] gameInstance de ses morts: ${gameInstance.gameID}`);
                        if (gameInstance.game_has_ended !== true) {
                            console.log(`[${client.id}] Game has ended false`);
                            gameInstance.stop = true;
                            const otherUser: User = await this.GameService.getOtherUser(this.game, user);
                            console.log(`[${client.id}] otherUsersocket : ${otherUser.gameSocketId}`)
                            if (user.login === gameInstance.playersLogin[0]) {
                                this.server.to(gameInstance.players[1]).emit('GameStop');
                            }
                            else {
                                this.server.to(gameInstance.players[0]).emit('GameStop');
                            }
                            console.log(`[${client.id}] otherUsersocket : ${otherUser.gameSocketId}`)
                            await this.GameService.updateStateGameForUsers(user, otherUser);
                            this.GameService.deleteGameSocketsIdForPlayers(user, otherUser);
                            setTimeout(async () => {
                                await this.GameService.deleteGame(this.game);
                            }, 1000); // peut etre faire un boolean avec un boucle qui deletelagame quand lautre user est suppr?
                        }
                        else {
                            console.log(`[${client.id}] Game has ended true`);
                            this.GameService.deleteGameSocketsIdForPlayer(user);
                            await this.GameService.updateStateGameForUser(user);
                        }
                    }
                }
            }
            delete this.connectedUsers[client.id];
            console.log(`[${client.id}] GameGtw client disconnected : ${client.id}`);
        }
        catch (err) {
            console.log(client.id)
            throw (err)
        }

    }


    
    @SubscribeMessage('checkGameInvite')
    handleCheckgameInvite(@ConnectedSocket() client: Socket, @MessageBody() data: {playerOneLogin: string, playerTwoLogin: string}) {
        // du coup en amont il faut creer des sockets pour les deux users. si pas bon supprimer les deux sockets
        
        // check si deja ingame or in matchmaking pour les deux
        // check si encore co
        // add sockets et set debut de game (room etc)
        //emit pour joinGameInvite
    }    

    @SubscribeMessage('joinGameInvite')
    handleJoinGameInvite(@ConnectedSocket() client: Socket, @MessageBody() data: {playerOneLogin: string, playerTwoLogin:string}) {
        // creer la game
        // emit joingame et gameStart pour playerJoined et apres tout ok !
    }

    @SubscribeMessage('linkSocketWithUser')
    @UseGuards(GatewayGuard)
    async handleLinkSocketWithUser(@ConnectedSocket() client: Socket, @MessageBody() data: { playerLogin: string }) {
        if (this.GameService.userHasAlreadyGameSockets(data.playerLogin)) {
            this.server.to(client.id).emit('returnGameInProgress');
            console.log(`Game or Matchmaking In Progress, InMatchmaking: {mettre le inMatchmaking}, InGame: {mettre le Ingame}`);
            return;
        }
        this.GameService.createNewGameSockets(data.playerLogin);
        this.GameService.addGameSocket(client.id, data.playerLogin);
        await this.GameService.linkSocketIDWithUser(client.id, data.playerLogin);
        console.log(`Link OK --> joining personnal room: ${client.id}`);
        // creating a personnal room so we can emit to the user
        client.join(data.playerLogin);
        this.server.to(data.playerLogin).emit('connectionDone');
    }

    @SubscribeMessage('Game')
    @UseGuards(GatewayGuard)
    handleGame(@ConnectedSocket() client: Socket, data: string): void {
        this.server.emit('message', data); // Diffuse à tous les clients dans le namespace 'game'
    }

    @SubscribeMessage('join-matchmaking')
    @UseGuards(GatewayGuard)
    async handleJoinMatchmaking(@ConnectedSocket() client: Socket, @MessageBody() data: { playerLogin: string }) {
        console.log(`== ${data.playerLogin} JOINS MATCHMAKING ==`);
        console.log(`idplayer ==== ${client.id}`);
        await this.MatchmakingService.joinNormalQueue(client.id, data.playerLogin);
        const enoughPlayers = await this.MatchmakingService.IsThereEnoughPairs();

        console.log("Ready to start: ", enoughPlayers);
        if (enoughPlayers) {
            const pairs: [string, string][] = await this.MatchmakingService.getPlayersPairsNormalQueue();
            for (const pair of pairs) {
                const socketIDs: [string, string] = [pair[0], pair[1]];
                this.game = await this.GameService.createGame(pair[0], pair[1]);
                if (!this.game)
                    throw new Error("Fatal error");
                const gameInstance: game_instance = this.GameEngineceService.createGameInstance(this.game);
                this.game_instance.push(gameInstance);
                this.MatchmakingService.leaveNormalQueue(pair[0]);
                this.MatchmakingService.leaveNormalQueue(pair[1]);
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
                    this.server.to([gameInstance.players[0], gameInstance.players[1]]).emit('startGameLoop');
                    const gameLoop = setInterval(() => {
                        this.executeGameTick(gameLoop, gameInstance, client.id)
                    }, 16)
                }, 3000);
            }
        }
    }

    async executeGameTick(gameLoop: NodeJS.Timeout, gameInstance: game_instance, client: string) {
        // if decconeciron {
        //     if this.game.
        // }
        //refaire la deconnection ici
        if (gameInstance.stop === true) {
            clearInterval(gameLoop);
            // enlever la gameInstance 
        }
        if (gameInstance.game_has_ended === true) {
			this.server.to([gameInstance.players[0], gameInstance.players[1]]).emit('GameEnd')
            clearInterval(gameLoop);
            if (this.game.gameEnd !== true && client == gameInstance.players[0]) {
                await this.GameService.endOfGame(this.game, gameInstance);
                // enlever la gameInstance
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
        console.log("emit leave-matchmaking");
        //demander a edouard pour directement fare l'appel leave-game au lieu de leavematch puis leave game car ca marchais pas et j'ai fais un truc bien clean
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
 * essayer d'ameliorer les collisions (avec gael)
 * creer un game mode
 * {
 *      recuperer le fait que le joueur ai lance en speed ou normal mode
 *      check normal du matchmaking
 *      si tout ok, emit joinmatchmaking mais avec un boolean normal === true ou normal === false si speed mode
 *      rentrer dans la bonne queue, (litteralement copier coller la queue)
 *      set la game et gameinstance avec le boolean (juste rajouter 0.2 a l'elasticity de la balle)
 *      puis tout ok
 * }
 * faire les game invites
 * {
 *      creer un socket aux deux users, check des 2 users, puis celui qui a invite cree la game et emit pour les 2
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
 * 
 * DEBUG :
 * probleme quand 2eUser essaie de spam startgame en meme temps que endgame a 1seconde pres
 */