import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { ChatService } from 'src/chat/chat.service';
import { UsersService } from 'src/users/users.service';
import { MessageDto } from 'src/chat/dto/message.dto';
import { GatewayGuard } from './Gatewayguard.guard';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common'
import dotenv from 'dotenv';
import { userInGame, userInMatchmaking } from 'src/game/matchmaking/matchmaking.service';
import { getPlayerSpeedQueue } from 'src/game/matchmaking/matchmaking.service';
import { setPlayerSpeedQueue } from 'src/game/matchmaking/matchmaking.service'; 
import { getPlayerNormalQueue } from 'src/game/matchmaking/matchmaking.service';
import { setPlayerNormalQueue } from 'src/game/matchmaking/matchmaking.service';

dotenv.config();

interface ConnectedUsers {
	userId: number,
	socket: Socket,
}

export interface GameInviteDto {
	emitUserId: number,
	targetUserId: number,
	isAcceptedEmitUser: boolean,
	isAcceptedTargetUser: boolean,
}

export interface InGameDto {
	emitUserId: number,
	targetUserId: number,
}

export const gameQueue: { [key: string]: GameInviteDto } = {};
export const inGame: { [key: string]: InGameDto } = {};

@WebSocketGateway({
	namespace: 'user',
	cors: {
		origin: ['http://localhost:3000', `${process.env.SERVER_REDIRECT_URI}`]
	},
	middlewares: [GatewayGuard],
})

export class GeneralGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private chatService: ChatService,
		private userService: UsersService,
	) { }

	@WebSocketServer()
	server: Server;

	// we link a userID with its socket
	private activeUsers : ConnectedUsers[] = [];

	private async userRejoinsRooms(client: Socket, userID: number) {

		try {
			const conversations = await this.chatService.getAllConversations(userID);
			if (conversations) {
				let ids = <number[]>[];
				conversations.forEach(function (value) {
					ids.push(value.id);
				});

				const conv = await this.chatService.getConversationArrayByID(ids);
				conv.forEach(function (value) {
					client.join(value.name + value.id);
				})

				const blockedUsers = await this.userService.getBlockedUserList(userID);
				if (blockedUsers) {
					blockedUsers.forEach((blockedUser: number) => {
						client.join(`whoblocked${blockedUser}`)
					})
				}
			}
		} catch (error) {
			// throw error;
		}
	}

	private async userLeavesRooms(client: Socket, userID: number) {

		try {
			const conversations = await this.chatService.getAllConversations(userID);
			if (conversations) {
				let ids = <number[]>[];
				conversations.forEach(function (value) {
					ids.push(value.id);
				});

				const conv = await this.chatService.getConversationArrayByID(ids);
				conv.forEach(function (value) {
					client.leave(value.name);
				})

				const blockedUsers = await this.userService.getBlockedUserList(userID);
				if (blockedUsers) {
					blockedUsers.forEach((blockedUser: number) => {
						client.leave(`whoblocked${blockedUser}`)
					})
				}
			}
		} catch (error) {
			// throw error;
		}
	}

	private async notifyFriendList(userID: number, clientId: string, status: string) {

		try {
			let user;
			if (status === 'online')
				user = await this.userService.updateUserStatus(userID, true);
			else if (status === 'offline')
				user = await this.userService.updateUserStatus(userID, false);
			else
				throw new HttpException('Fatal error', HttpStatus.BAD_REQUEST);

			if (user) {

				const friends = await this.userService.getFriendships(userID);
				if (friends) {

					friends.forEach((friend: any) => {
						this.activeUsers.forEach((user_: ConnectedUsers) => {
							if (user_.userId == friend.id) {
								console.log("-- Notifying connection/deconnction of ", friend.username, " --");
								this.server.except(clientId).to(user_.socket.id).emit('refreshUserOnlineState', `${user.username} is ${status}`);
							}
						});
					});

					// Emit to refresh DM list for user who are not friends
					this.server.except(clientId).emit('refreshUserOnlineState');

					return;
				}
			}
		} catch (error) {
			// throw error;
		}

	}

	@UseGuards(GatewayGuard)
	async handleConnection(client: Socket) {
		try {

			client.on('joinPersonnalRoom', (userID: number) => {

				let count = 0;
				this.activeUsers.forEach((user: ConnectedUsers) => {
					if (user.userId === userID)
						count++;
				});
				if (count != 1) {
					Object.keys(inGame).forEach(key => {
						const dto : InGameDto = inGame[key];
						if (dto.emitUserId === userID || dto.targetUserId === userID) {
							console.log("inGame[key]", inGame[key])
							delete inGame[key];
						}
					});
					Object.keys(gameQueue).forEach(key => {
						console.log("gameQueue[key]", gameQueue[key])

						const dto = gameQueue[key];
						if (dto.emitUserId === userID || dto.targetUserId === userID) {
							console.log("gameQueue[key]", gameQueue[key])
							delete gameQueue[key];
						}
					});
					Object.keys(userInGame).forEach(key => {
						const dto = userInGame[key];
						if (dto) {
							userInGame[key] = false;
						}
					});
					Object.keys(userInMatchmaking).forEach(key => {
						const dto = userInMatchmaking[key];
						if (dto) {
							userInMatchmaking[key] = false;
						}
					});
		
					const playerNormalQueue = getPlayerNormalQueue();
					playerNormalQueue.filter(item => item.userId !== userID);
					setPlayerNormalQueue(playerNormalQueue);
					const playerSpeedQueue = getPlayerSpeedQueue();
					playerSpeedQueue.filter(item => item.userId !== userID);
					setPlayerSpeedQueue(playerSpeedQueue);
				}

				const newUser : ConnectedUsers = {
					userId: userID,
					socket: client,
				}
				console.log("-------------------------------------------------------------------------------");
				console.log(`================ Active user list before PUSH: `, this.activeUsers);
				this.activeUsers.push(newUser);
				console.log(`================ Active user list After PUSH: `, this.activeUsers);
				console.log("-------------------------------------------------------------------------------");
				client.join(client.id);
				console.log("== Client ", userID, " has joined ", client.id, " room");
				this.userRejoinsRooms(client, userID);
				this.notifyFriendList(userID, client.id, 'online');
				this.server.emit('newUser');

				client.on('disconnect', () => {

					let count = 0;
					this.activeUsers.forEach((user: ConnectedUsers) => {
						if (user.userId === userID)
							count++;
					});
					if (count != 1) {
						Object.keys(inGame).forEach(key => {
							const dto : InGameDto = inGame[key];
							if (dto.emitUserId === userID || dto.targetUserId === userID) {
								delete inGame[key];
							}
						});
						Object.keys(userInGame).forEach(key => {
							const dto = userInGame[key];
							if (dto) {
								userInGame[key] = false;
							}
						});
						Object.keys(gameQueue).forEach(key => {
							console.log("gameQueue[key]", gameQueue[key])
							const dto = gameQueue[key];
							if (dto.emitUserId === userID || dto.targetUserId === userID) {
								delete gameQueue[key];
							}
						});
						Object.keys(userInMatchmaking).forEach(key => {
							const dto = userInMatchmaking[key];
							if (dto) {
								userInMatchmaking[key] = false;
								
							}
						});
						const playerNormalQueue = getPlayerNormalQueue(); 
						playerNormalQueue.filter(item => item.userId !== userID);
						setPlayerNormalQueue(playerNormalQueue);

						const playerSpeedQueue = getPlayerSpeedQueue(); 
						playerSpeedQueue.filter(item => item.userId !== userID);
						setPlayerSpeedQueue(playerSpeedQueue);
					}

					console.log("-------------------------------------------------------------------------------");
					console.log(`Active user list before FILTER: `, this.activeUsers);
					console.log("Client to delete: ", client.id);
					this.activeUsers.forEach((user: ConnectedUsers) => {
						if (client.id === user.socket.id)
							console.log("FOUND USER TO DELETE: ", client.id, user.socket.id);
					})
					this.activeUsers = this.activeUsers.filter((user: ConnectedUsers) => client.id !== user.socket.id);
					console.log(`Active user list after FILTER: `, this.activeUsers);
					console.log("-------------------------------------------------------------------------------");

					console.log("===> Disconnecting user ", userID, " with ID ", userID);
					this.notifyFriendList(userID, client.id, 'offline');
					client.leave(client.id);
					console.log("Client ", userID, " has left ", client.id, " room");
					this.userLeavesRooms(client, userID);
				});
			});
		} catch (error) {
			console.log(' == Gatewway: ', error);
		}
	}

	async handleException(error: Error, client: Socket) {
		console.log(`[GAME_ERROR]: ${error.stack}`)
		console.log(`[GAME_ERROR] ${error.name}, ${error.message}`)
		client.emit("exception", { error: error.message })
	}

	handleDisconnect(client: Socket) {
		console.log(`== GeneralGtw ---> USERSOCKET client disconnected: ${client.id}`);
	}


	@SubscribeMessage('joinRoom')
	@UseGuards(GatewayGuard)
	async addUserToRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomName: string, roomID: string }) {

		// verifier que le user peut join? (est dans la conversation)
		try {
			const { roomName, roomID } = data;
			const user = client.handshake.auth.user;
			console.log("==== joinRoom Event ====");
			console.log("Add ", "[", client.id, "]", " to room : ", roomName + roomID);

			// If there is an ID, we are joining a channel room
			if (roomID && await this.chatService.isUserInConversation(user.sub, Number(roomID))) {
				// the current user socket joins
				client.join(roomName + roomID);
				// Each socket of the user (multi-window) joins the room
				this.activeUsers.forEach((user_: ConnectedUsers) => {
					if (user_.userId == user.sub)
						user_.socket.join(roomName + roomID);
				});
				// event to refresh the user list of a channel
				this.server.to(roomName + roomID).emit('refresh_channel');
			}
			else {
				client.join(roomName); // joining personnal room
				this.activeUsers.forEach((user_: ConnectedUsers) => {
					if (user_.userId == user.sub)
						user_.socket.join(roomName);
				});
			}

			this.server.emit('refresh_channel');
			// event to refresh the global user list
			this.server.emit('refreshGlobalUserList');
			// event to refresh the channel list
			this.server.emit('refreshChannelList');
			// event to refresh the friend list
			this.server.emit('refreshFriends');

			return;

		} catch (error) {
			throw error;
		}
	}

	@SubscribeMessage('leaveRoom')
	@UseGuards(GatewayGuard)
	async leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomName: string, roomID: string }) {

		const { roomName, roomID } = data;
		const user = client.handshake.auth.user;
		console.log("==== leaveRoom Event ====");
		console.log("Remove ", "[", client.id, "]", " to room : ", roomName + roomID);
		if (roomID) {
			// the current user socket leaves
			client.leave(roomName + roomID);
			// Each socket of the user (multi-window) leaves the room
			this.activeUsers.forEach((user_: ConnectedUsers) => {
				if (user_.userId == user.sub)
					user_.socket.leave(roomName + roomID);
			});
			// event to refresh the user list of a channel
			this.server.to(roomName + roomID).emit('refresh_channel');
			this.server.to(roomName + roomID).emit('refreshOptionsUserChannel');
		}
		else {
			client.leave(roomName); // leaving personnal room
			this.activeUsers.forEach((user_: ConnectedUsers) => {
				if (user_.userId == user.sub)
					user_.socket.leave(roomName);
			});
		}

		this.server.emit('refresh_channel');
		// event to refresh the global user list
		this.server.emit('refreshGlobalUserList');
		// event to refresh the channel list
		this.server.emit('refreshChannelList');
		// event to refresh the friend list
		this.server.emit('refreshFriends');
		return;
	}

	// comment securiser? que le gar qui ajoute soit dans la conv?
	@SubscribeMessage('addUserToRoom')
	@UseGuards(GatewayGuard)
	addUserToNewRoom(@MessageBody() data: { convID: number, convName: string, friend: number }) {
		const { convID, convName, friend } = data;
		console.log("==== addUserToRoom Event ====");
		console.log("Emit to add ", friend, " to room : ", convName + convID);
		this.activeUsers.forEach((user: ConnectedUsers) => {
			if (user.userId == friend) {
				this.server.to(user.socket.id).emit('userAddedToRoom', {
					convID: convID,
					convName: convName,
				});
			}
		});
	}

	@SubscribeMessage('inviteAccepted')
	@UseGuards(GatewayGuard)
	async inviteAccepted(@ConnectedSocket() client: Socket, @MessageBody() data: { otherUserId: number, userGameSocketId: string }) {
		try {

			const emitUserId = client.handshake.auth.user.sub;
			const targetUser = await this.userService.getUserByID(data.otherUserId);
			if (!emitUserId || !targetUser.id || (emitUserId === targetUser.id)) {
				console.log(`[check de l'existence des users] : les deux id sont pas la`);
				return;
			}
			const targetUserId: number = data.otherUserId;
			const uniqueKey = `${Math.min(emitUserId, targetUserId)}-${Math.max(emitUserId, targetUserId)}`
			
			console.log(`inGame[uniqueKey] dans inviteAccepted :  ${emitUserId} |  ${targetUserId}`)
			if (inGame[uniqueKey])

				if (!inGame[uniqueKey]) {
					await this.userService.unsetUserInGame(emitUserId);
					console.log(`DECO LAUNCH GAME INVITE`,);
					this.activeUsers.forEach((user: ConnectedUsers) => {
						if (user.userId == emitUserId)
							this.server.to(user.socket.id).emit('badsenderIdGameInvite');
					});
					return;
				}
			console.log(`[inGame in InvitedAccepted], ${inGame[uniqueKey].emitUserId} | ${inGame[uniqueKey].targetUserId}`)
			const otherUser = await this.userService.getUserByID(data.otherUserId);
			this.activeUsers.forEach((user: ConnectedUsers) => {
				if (user.userId == otherUser.id)
					this.server.to(user.socket.id).emit('acceptInvitation', { userTwoId: emitUserId, userTwoGameId: data.userGameSocketId });
			});
		} catch (error) {
			console.log(`[GAME INVITE ERROR]: ${error.stack}`)
		}
	}

	@SubscribeMessage('checkAndsetInGame')
	@UseGuards(GatewayGuard)
	async checkAndSetInGame(@ConnectedSocket() client: Socket, @MessageBody() targetUserId: number) {
		try {

			const emitUserId = client.handshake.auth.user.sub;
			const EmitUser = await this.userService.getUserByID(emitUserId);
			const targetUser = await this.userService.getUserByID(targetUserId);
			if (!emitUserId || !targetUser.id || !EmitUser || (emitUserId === targetUserId)) {
				console.log(`[check de l'existence des users] : les deux id sont pas la`);
				return;
			}

			const uniqueKey = `${Math.min(emitUserId, targetUserId)}-${Math.max(emitUserId, targetUserId)}`
			if (uniqueKey in gameQueue) {
				if (gameQueue[uniqueKey] && gameQueue[uniqueKey].isAcceptedTargetUser && gameQueue[uniqueKey].isAcceptedEmitUser) {
					console.log(`pas dans la room alors sort de la !`)
					return;
				}
			}

			console.log(`[checkAndsetInGame] : otherUserIsActive: ${targetUser.isActive}, userActive: ${EmitUser.isActive}`)
			if (this.userService.usersInGame(emitUserId, targetUserId) || !targetUser.isActive || !EmitUser.isActive) {
				console.log(`users already inGame or Inactive`);
				return;
			}
			const pairInGame = {
				emitUserId: emitUserId,
				targetUserId: targetUserId,
			}
			inGame[uniqueKey] = pairInGame;
			await this.userService.setUsersInGame(emitUserId, targetUserId)
			this.activeUsers.forEach((user: ConnectedUsers) => {
				if (user.userId == emitUserId)
					this.server.to(user.socket.id).emit('usersNotInGame', targetUserId);
			});
		} catch (error) {
			console.log(`[GAME INVITE ERROR]: ${error.stack}`)
		}
	}


	@SubscribeMessage('checkAndSetUserInMatchmaking')
	@UseGuards(GatewayGuard)
	async handleSetUserInMatchmaking(@ConnectedSocket() client: Socket) {
		try {
			const user = client.handshake.auth.user;
			if (!user) {
				console.log(`[checkAndSetUserInMatchmaking] : ${user.sub}`)
				return;
			}
			// a changer pour le ingame et le inMatchmaking
			if (await this.userService.userInGame(user.sub)) {
				console.log(`sender already inGame`);
				this.activeUsers.forEach((user_: ConnectedUsers) => {
					if (user_.userId == user.sub)
						this.server.to(user_.socket.id).emit('userInGame');
				});
				return;
			}
			userInMatchmaking[user.sub] = true;
			await this.userService.setUserInMatchmaking(user.sub);
			this.activeUsers.forEach((user_: ConnectedUsers) => {
				if (user_.userId == user.sub)
					this.server.to(user_.socket.id).emit('gameNotInProgress');
			});
		}
		catch (error) {
			await this.handleException(error, client)
		}
	}

	@SubscribeMessage('setGameInvite')
	async handleEvent(@ConnectedSocket() client: Socket, @MessageBody() data: { userTwoId: number, userTwoGameId: string }) {
		const emitUserId = client.handshake.auth.user.sub;
		const targetUserId = data.userTwoId;

		const uniqueKey = `${Math.min(emitUserId, targetUserId)}-${Math.max(emitUserId, targetUserId)}`
		if (!inGame[uniqueKey]) {
			await this.userService.unsetUserInGame(emitUserId);
			this.activeUsers.forEach((user: ConnectedUsers) => {
				if (user.userId == emitUserId)
					this.server.to(user.socket.id).emit('badsenderIdGameInvite');
			});
			return;
		}
		// check aussi la game socket?
		this.activeUsers.forEach((user: ConnectedUsers) => {
			if (user.userId == emitUserId)
				this.server.to(user.socket.id).emit('createGameInviteSocket', { userTwoId: data.userTwoId, userTwoGameId: data.userTwoGameId });
		});
	}


	@SubscribeMessage('InviteToGame')
	@UseGuards(GatewayGuard)
	async inviteUserToGame(@ConnectedSocket() client: Socket, @MessageBody() targetUserId: number) {
		try {
			const emitUserId = client.handshake.auth.user.sub;
			const targetToInvite = await this.userService.getUserByID(targetUserId);
			if (!emitUserId || !targetToInvite.id || (emitUserId === targetToInvite.id)) {
				console.log(`[check de l'existence des users] : les deux id sont bien la`);
				return;
			}

			// Check if the sender is blocked by the recipient
			targetToInvite.blockedUsers.forEach((user: number) => {
				if (user == emitUserId) {
					console.log("User is blocked");
					throw new Error("User is blocked");
				}
			});

			//clé unique basée sur emitUserId et targetUserId
			const uniqueKey = `${Math.min(emitUserId, targetUserId)}-${Math.max(emitUserId, targetUserId)}`
			// check si les deux users sont deja en game
			if (this.userService.usersInGame(emitUserId, targetUserId)) {
				this.activeUsers.forEach((user: ConnectedUsers) => {
					if (user.userId == emitUserId)
						this.server.to(user.socket.id).emit('usersInGame');
				});
				console.log(`[check si l'un des deux users sont deja en game] : l'un des deux users sont deja en game`);
				return;
			}
			var newPair: GameInviteDto;
			if (uniqueKey in gameQueue) {
				const existingPair = gameQueue[uniqueKey];
				const isInvitedByExistingUser = existingPair.emitUserId !== emitUserId;
				newPair = {
					emitUserId: emitUserId,
					targetUserId: targetUserId,
					isAcceptedEmitUser: true,
					isAcceptedTargetUser: isInvitedByExistingUser || existingPair.isAcceptedTargetUser,
				};
			} else {
				newPair = {
					emitUserId: emitUserId,
					targetUserId: targetUserId,
					isAcceptedEmitUser: true,
					isAcceptedTargetUser: false,
				};
			}

			//LA PAIR EXISTE DEJA
			if (uniqueKey in gameQueue) {
				gameQueue[uniqueKey] = newPair;
				if (newPair && newPair.isAcceptedTargetUser && newPair.isAcceptedEmitUser) {
					console.log(`[La target a fait aussi la demande] : il faut lancer la game`);
					const pairInGame = {
						emitUserId: emitUserId,
						targetUserId: targetUserId,
					}
					inGame[uniqueKey] = pairInGame;
					console.log(`inGame[uniqueKey] dans inviteToGame :  ${inGame[uniqueKey].emitUserId} |  ${inGame[uniqueKey].targetUserId}`)
					this.userService.setUsersInGame(newPair.emitUserId, newPair.targetUserId);
          if (gameQueue.hasOwnProperty(uniqueKey)) {
						delete gameQueue[uniqueKey];
						console.log('La paire a été supprimée de la queue.');
					} else {
						console.log('La clé spécifiée n\'existe pas dans la queue.');
					}
					this.activeUsers.forEach((user: ConnectedUsers) => {
						if (user.userId == emitUserId)
							this.server.to(user.socket.id).emit('gameInviteDUO', targetUserId);
					});     
					return;
				}
				else {
					console.log(`[forceur] : Enorme Forceur`);
					return;
				}
			}
			else //  LA PAIRE N'EXISTE PAS
			{
				console.log('===============>La clé n\'existe pas dans gameQueue.');
				gameQueue[uniqueKey] = newPair;
				this.activeUsers.forEach((user: ConnectedUsers) => {
					if (user.userId == targetToInvite.id) {
						this.server.to(user.socket.id).emit('gameInvite', {
							senderUsername: client.handshake.auth.user.username,
							senderUserID: emitUserId,
						});
					}
				});
			}
		}
		catch (error) {
			console.log(`[GAME INVITE ERROR]: ${error.stack}`)
		}
	}

	@SubscribeMessage('closeToast')
	@UseGuards(GatewayGuard)
	async closeToast(@ConnectedSocket() client: Socket) {
		try {
			console.log(`[JE SIUS LE CLOSETOAST]`)

		} catch (error) {
			console.log(`[GAME INVITE ERROR]: ${error.stack}`)
		}
	}

	@SubscribeMessage('inviteClosed')
	@UseGuards(GatewayGuard)
	async handleInviteClosed(@ConnectedSocket() client: Socket, @MessageBody() targetUserId: number) {
		console.log("[inviteClosed] CLOSED")
		try {
			const emitUserId = client.handshake.auth.user.sub;
			console.log(`[emitUserId] : ${emitUserId}`)
			console.log(`[targetUserId] : ${targetUserId}`)
			const uniqueKey = `${Math.min(emitUserId, targetUserId)}-${Math.max(emitUserId, targetUserId)}`
			// Supprimez existingPair de gameQueue
			if (gameQueue.hasOwnProperty(uniqueKey)) {
				delete gameQueue[uniqueKey];
				console.log('La paire a été supprimée de la queue.');
			} else {
				console.log('La clé spécifiée n\'existe pas dans la queue.');
			}
		} catch (error) {
			console.log(`[GAME INVITE ERROR]: ${error.stack}`)
		}
	}

	@SubscribeMessage('inviteDenied')
	@UseGuards(GatewayGuard)
	async handleInviteDenied(@ConnectedSocket() client: Socket, @MessageBody() data: { senderUserId: number }) {
		console.log("[inviteDenied] DENY")
		// peut etre check l'Id? apres le seul souci c'est qu'il peut renvoyer une invite plus vite
		try {
			const user = await this.userService.getUserByID(data.senderUserId)
			this.activeUsers.forEach((user_: ConnectedUsers) => {
				if (user_.userId == user.id)
					this.server.to(user_.socket.id).emit('deniedInvitation');
			});
		}
		catch (error) {
			console.log(`[GAME INVITE ERROR]: ${error.stack}`)
		}
	}

	@SubscribeMessage('message')
	@UseGuards(GatewayGuard)
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { dto: MessageDto, conversationName: string }) {

		const { dto, conversationName } = data;
		const user = client.handshake.auth.user;

		const verifyUser = await this.chatService.isUserInConversation(user.sub, dto.conversationID);
		if (verifyUser) {

			// The room's name is not the conversation's name in DB
			this.server.to(conversationName + dto.conversationID).except(`whoblocked${verifyUser.id}`).emit('onMessage', {
				from: verifyUser.username,
				senderId: user.sub,
				content: dto.content,
				post_datetime: dto.post_datetime,
				conversationID: dto.conversationID,
				conversationName: conversationName,
			});
			return;
		}

		throw new HttpException("User not found", HttpStatus.NOT_FOUND);
	}

	@SubscribeMessage('addFriend')
	@UseGuards(GatewayGuard)
	async handleFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() data: { recipientLogin: string }) {

		// user is the initiator of the friend request
		// si le mec est bloque on se barre de la grooooos
		try {
			const { recipientLogin } = data;
			const user = client.handshake.auth.user;
			const checkedInitiator = await this.userService.getUserByID(user.sub);
			const checkedRecipient = await this.userService.getUserByUsername(recipientLogin);
			if (!checkedRecipient.blockedUsers.find((user: number) => user === checkedInitiator.id)) {
				if (checkedInitiator && checkedRecipient) {

					this.activeUsers.forEach((user_: ConnectedUsers) => {
						if (user_.userId == checkedRecipient.id) {
							this.server.to(user_.socket.id).except(`whoblocked${checkedInitiator.id}`).emit('friendRequest', {
								recipientLogin: recipientLogin,
								initiatorID: Number(user.sub),
								initiatorLogin: checkedInitiator.username,
							});
							this.server.to(user_.socket.id).except(`whoblocked${checkedInitiator.id}`).emit('refreshHeaderNotif');
						}
					});
				}
			}
			console.error(`${checkedInitiator.username} is blocked`);
		} catch (error) {
			// throw error;
		}
	}

	@SubscribeMessage('friendRequestAccepted')
	@UseGuards(GatewayGuard)
	async handleAcceptedFriendRequest(@MessageBody() data: { roomName: string, roomID: string, initiator: string, recipient: string }) {

		try {
			const { roomName, roomID, initiator, recipient } = data;
			const checkedInitiator = await this.userService.getUserByUsername(initiator);
			const checkedRecipient = await this.userService.getUserByUsername(recipient);
			if (checkedInitiator && checkedRecipient) {
				this.server.to(initiator).emit('friendRequestAcceptedNotif', {
					roomName: roomName,
					roomID: roomID,
					recipient: recipient,
				})
				this.activeUsers.forEach((user: ConnectedUsers) => {
					if (user.userId == checkedInitiator.id) {
						this.server.to(user.socket.id).emit('refreshFriends');
						this.server.to(user.socket.id).emit('refreshFriends');
						this.server.to(user.socket.id).emit('refreshHeaderNotif');
					}
				});
			}
		} catch (error) {
			// throw error;
		}
	}

	/* REFRESH HANDLERS */

	@SubscribeMessage('refreshUserOptionsChannel')
	@UseGuards(GatewayGuard)
	handleRefreshUserOptionsChannel(@ConnectedSocket() client: Socket) {

		try {
			const user = client.handshake.auth.user;
			if (user) {
				this.activeUsers.forEach((user_: ConnectedUsers) => {
					console.log(`Refresh ${user.socket.id} user options`);
					this.server.to(user_.socket.id).except(client.id).emit('refreshOptionsUserChannel');
				})
				console.log("Out of user options refresh loop");
			}
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		} catch (error) {
			// throw error;
		}
	}

	@SubscribeMessage('banUser')
	@UseGuards(GatewayGuard)
	handleUserBan(@MessageBody() data: { userToBan: number, roomName: string, roomID: string }) {
		const { userToBan, roomName, roomID } = data;
		// on pourrait rajouter une verif du back
		// This event aims to disable showChannel and to make the targeted user to leave the room
		this.activeUsers.forEach((user: ConnectedUsers) => {
			if (user.userId == userToBan) {
				this.server.to(user.socket.id).emit('userIsBan', {
					roomName: roomName,
					roomID: roomID,
				});
			}
		});
		this.server.emit('refreshChannelList');
	}

	@SubscribeMessage('unbanUser')
	@UseGuards(GatewayGuard)
	handleUserUnban(@MessageBody() data: { userToUnban: number, roomName: string, roomID: string }) {
		const { userToUnban, roomName, roomID } = data;
		// on pourrait rajouter une verif du back
		// This event aims to make the targeted user to rejoin the room
		this.activeUsers.forEach((user: ConnectedUsers) => {
			if (user.userId == userToUnban) {
				this.server.to(user.socket.id).emit('userIsBan', {
					roomName: roomName,
					roomID: roomID,
				});
			}
		});
		this.server.emit('refreshChannelList');
	}

	@SubscribeMessage('deleteChannel')
	@UseGuards(GatewayGuard)
	handleDeleteChannel(@MessageBody() data: { roomName: string, roomID: string }) {
		const { roomName, roomID } = data;
		this.server.to(roomName + roomID).emit('channelDeleted', {
			roomName: roomName,
			roomID: roomID,
		});
	}

	@SubscribeMessage('kickUserFromChannel')
	@UseGuards(GatewayGuard)
	handleKickUser(@MessageBody() data: { userToKick: number, roomName: string, roomID: string }) {
		const { userToKick, roomName, roomID } = data;
		this.activeUsers.forEach((user: ConnectedUsers) => {
			if (user.userId == userToKick) {
				this.server.to(user.socket.id).emit('kickUser', {
					roomName: roomName,
					roomID: roomID,
				});
			}
		});
	}

	@SubscribeMessage('refreshUserChannelList')
	@UseGuards(GatewayGuard)
	handleRefresh(@MessageBody() data: { roomName: string, roomID: string }) {
		const { roomName, roomID } = data;
		this.server.to(roomName + roomID).emit('refreshChannelList');
	}

	@SubscribeMessage('refreshOptionsUserChannel')
	@UseGuards(GatewayGuard)
	handleRefreshOption(@MessageBody() data: { userToRefresh: number }) {
		const { userToRefresh } = data;
		this.activeUsers.forEach((user: ConnectedUsers) => {
			if (user.userId == userToRefresh)
				this.server.to(user.socket.id).emit('refreshOption');
		});
	}

	@SubscribeMessage('refreshChannelList')
	@UseGuards(GatewayGuard)
	handleRefreshChannel(@MessageBody() data: { roomName: string, roomID: string }) {
		const { roomName, roomID } = data;
		this.server.to(roomName + roomID).emit('refreshChannelListBis');
	}

	@SubscribeMessage('refreshUser')
	@UseGuards(GatewayGuard)
	handleUserRefresh(@MessageBody() data: { userToRefresh: number, target: string, status: boolean }) {
		const { userToRefresh, target, status } = data;
		// custom event to refresh on a particular user room
		this.activeUsers.forEach((user: ConnectedUsers) => {
			if (user.userId == userToRefresh)
				this.server.to(user.socket.id).emit(target, status);
		});
		// event to refresh the user list of a channel
		this.server.emit('refresh_channel');
	}

	@SubscribeMessage('refreshHeader')
	@UseGuards(GatewayGuard)
	handleRefreshheader() {
		this.server.emit('refreshHeaderNotif');
	}

	@SubscribeMessage('refreshUserList')
	@UseGuards(GatewayGuard)
	handleRefreshUserlList() {
		this.server.emit('refreshFriends');
		this.server.emit('refreshGlobalUserList');
		this.server.emit('refreshDmList');
		this.server.emit('refreshChannelList');
		this.server.emit('refresh_channel');
	}

	@SubscribeMessage('refreshAvatar')
	@UseGuards(GatewayGuard)
	handleRefreshAvatar() {
		this.server.emit('refreshFriends');
		this.server.emit('refreshGlobalUserList');
		this.server.emit('refreshDmList');
		this.server.emit('refreshChannelList');
		this.server.emit('refresh_channel');
		this.server.emit('refreshGameHistory');
	}

	@SubscribeMessage('emitNotification')
	@UseGuards(GatewayGuard)
	async handleNotif(@MessageBody() data: { channel: string, content: string, channelID: string }) {

		try {
			const { channel, content, channelID } = data;
			const dto = {
				from: 'Bot',
				content: content,
				post_datetime: new Date(),
				conversationID: channelID,
			};
			await this.chatService.saveNotification(dto);
			this.server.to(channel).emit('recv_notif', dto);
		} catch (error) {
			throw error;
		}
	}
}
