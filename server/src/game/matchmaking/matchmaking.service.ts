import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../entities/games.entity';
import { UserOptionsDto } from 'src/chat/dto/userOptionsDto.dto';

export let userInGame: { [userId: number]: boolean };
export let userInMatchmaking: { [userId: number]: boolean };
export let playersNormalQueue: Queue[] = [];
export let playersSpeedQueue: Queue[] = [];

userInGame = {};
userInMatchmaking = {};

export interface Queue{
	gameSocketId: string
	userId : number;
}

export const getPlayerSpeedQueue = () => {

	return playersSpeedQueue;
}

export const setPlayerSpeedQueue = (value: Queue[]) => {
	playersSpeedQueue = value;
}

export const getPlayerNormalQueue = () => {

	return playersNormalQueue;
}

export const setPlayerNormalQueue = (value: Queue[]) => {
	playersNormalQueue = value;
}

@Injectable()
export class MatchmakingService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,


	) { }
	async getPlayersPairsQueue(gameMode: string) {
		const pairs: Array<[string, string]> = [];
		if (gameMode === "NORMAL") {
			for (let i = 0; i < playersNormalQueue.length - 1; i += 2) {
				pairs.push([playersNormalQueue[i].gameSocketId, playersNormalQueue[i + 1].gameSocketId]);
				console.log("Found a socket pair");
			}
		}
		else if (gameMode === "SPEED") {
			for (let i = 0; i < playersSpeedQueue.length - 1; i += 2) {
				pairs.push([playersSpeedQueue[i].gameSocketId, playersSpeedQueue[i + 1].gameSocketId]);
				console.log("Found a socket pair");
			}
		}
		return pairs;
	}

	async joinQueue(gameSocketId: string, userId: number, gameMode: string) {
		userInMatchmaking[userId] = true;
		const newUser: User = await this.usersRepository.findOne({ where: { id: userId } })
		const socketIdUserId: Queue = {
			gameSocketId : gameSocketId,
			userId : userId,
		}
		if (!newUser)
			throw new Error(`new user undefined`)
		// check if user is already in queue normal or speed
		if ((playersNormalQueue.find(player => player.userId === userId)) || (playersSpeedQueue.find(player => player.userId === userId)))
			throw new Error(`User alredy in Matchmaking`);
		if (gameMode === "NORMAL")
			playersNormalQueue.push(socketIdUserId);
		else if (gameMode === "SPEED") {
			newUser.inSpeedQueue = true;
			playersSpeedQueue.push(socketIdUserId);
		}
		await this.usersRepository.save(newUser);
	}

	async leaveQueue(playerID: string, userId: number) {
		console.log(`[leaveQueue] : playerId: ${playerID}`);
		const socketIdUserId: Queue = {
			gameSocketId : playerID,
			userId : userId,
		}
		const newUser: User = await this.usersRepository.findOne({ where: { id: userId } })
		if (!newUser)
			throw new Error(`[LEAVEQUEUE]: user not found`);
		userInMatchmaking[userId] = false;
		newUser.inMatchmaking = false;
		if (newUser.inSpeedQueue === false) {
			console.log(`LEAVE NORMAL QUEUE`);
			playersNormalQueue.splice(playersNormalQueue.indexOf(socketIdUserId), 1);
		}
		else {
			newUser.inSpeedQueue = false;
			console.log(`LEAVE SPEED QUEUE`);
			playersSpeedQueue.splice(playersSpeedQueue.indexOf(socketIdUserId), 1);
		}
		await this.usersRepository.save(newUser);
		return;
	}

	IsThereEnoughPairs(gameMode: string) {
		if (gameMode === "NORMAL" && (playersNormalQueue.length >= 2))
			return true;
		else if (gameMode === "SPEED" && (playersSpeedQueue.length >= 2)) {
			return true;
		}
		return false;
	}
}
