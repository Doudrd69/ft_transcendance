import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../entities/games.entity';

@Injectable()
export class MatchmakingService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,


	) { }

	public playersNormalQueue: string[] = [];
	public playersSpeedQueue: string[] = [];
	async getPlayersPairsQueue(gameMode: string) {
		const pairs: Array<[string, string]> = [];
		if (gameMode === "NORMAL") {
			for (let i = 0; i < this.playersNormalQueue.length - 1; i += 2) {
				pairs.push([this.playersNormalQueue[i], this.playersNormalQueue[i + 1]]);
				console.log("Found a socket pair");
			}
		}
		else if (gameMode === "SPEED") {
			for (let i = 0; i < this.playersSpeedQueue.length - 1; i += 2) {
				pairs.push([this.playersSpeedQueue[i], this.playersSpeedQueue[i + 1]]);
				console.log("Found a socket pair");
			}
		}
		return pairs;
	}

	async joinQueue(gameSocketId: string, userId: number, gameMode: string) {
		const newUser: User = await this.usersRepository.findOne({ where: { id: userId } })
		if (!newUser)
			throw new Error(`new user undefined`)
		// check if user is already in queue normal or speed
		if (this.playersNormalQueue.includes(gameSocketId) || this.playersSpeedQueue.includes(gameSocketId))
			throw new Error(`User alredy in Matchmaking`);
		if (gameMode === "NORMAL" )
			this.playersNormalQueue.push(gameSocketId);
		else if (gameMode === "SPEED") {
			newUser.inSpeedQueue = true;
			this.playersSpeedQueue.push(gameSocketId);
		}
		console.log(`joinSpeedQueue: ${this.playersSpeedQueue}`)
		console.log(`joinNormalQueue: ${this.playersNormalQueue}`)
		await this.usersRepository.save(newUser);
	}

	async leaveQueue(playerID: string, userId: number) {
		console.log(`[leaveQueue] : playerId: ${playerID}`);
		const newUser: User = await this.usersRepository.findOne({ where: { id: userId } })
		if (!newUser)
			throw new Error(`[LEAVEQUEUE]: user not found`);
		newUser.inMatchmaking = false;
		if (newUser.inSpeedQueue === false) {
			console.log(`LEAVE NORMAL QUEUE`);
			this.playersNormalQueue.splice(this.playersNormalQueue.indexOf(playerID), 1);
		}
		else {
			newUser.inSpeedQueue = false;
			console.log(`LEAVE SPEED QUEUE`);
			this.playersSpeedQueue.splice(this.playersSpeedQueue.indexOf(playerID), 1);
		}
		await this.usersRepository.save(newUser);
		console.log(`quitSpeedQueue: ${this.playersSpeedQueue}`)
		console.log(`quitNormalQueue: ${this.playersNormalQueue}`)
		return;
	}

	async IsThereEnoughPairs(gameMode: string) {
		if (gameMode === "NORMAL" && (this.playersNormalQueue.length >= 2))
			return true;
		else if (gameMode === "SPEED" && (this.playersSpeedQueue.length >= 2)) {
			return true;
		}
		return false;
	}
}
