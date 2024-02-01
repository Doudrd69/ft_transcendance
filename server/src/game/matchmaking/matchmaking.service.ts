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
        // Créer des paires
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

    async joinQueue(playerID: string, userId: number, gameMode: string) {
        const newUser: User = await this.usersRepository.findOne({ where: { id: userId } })
        if (gameMode === "NORMAL")
            this.playersNormalQueue.push(playerID);
        else if (gameMode === "SPEED") {
            newUser.inSpeedQueue = true;
            this.playersSpeedQueue.push(playerID);
        }
        newUser.inMatchmaking = true;
        console.log(`User game : ${newUser.inGame}`);
        console.log(`joinSpeedQueue: ${this.playersSpeedQueue}`)
        console.log(`joinNormalQueue: ${this.playersNormalQueue}`)
        await this.usersRepository.save(newUser);
    }

    async leaveQueue(playerID: string, gameMode: string, userId: number) {
        const newUser: User = await this.usersRepository.findOne({ where: { id: userId } })
        if (gameMode === "NORMAL") {
            this.playersNormalQueue.splice(this.playersNormalQueue.indexOf(playerID), 1);
        }
        else if (gameMode === "SPEED") {
            newUser.inSpeedQueue = false;
            this.playersSpeedQueue.splice(this.playersSpeedQueue.indexOf(playerID), 1);
        }
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

