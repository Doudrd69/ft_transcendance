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

    async joinQueue(playerID: string, playerLogin: string, gameMode: string) {
        if (gameMode === "NORMAL")
            this.playersNormalQueue.push(playerID);
        else if (gameMode === "SPEED") {
            this.playersSpeedQueue.push(playerID);
        }
        const newUser: User = await this.usersRepository.findOne({ where: { login: playerLogin } })
        if (!newUser)
            console.log(`No User for this gameSocketId: ${playerID}`);
        newUser.inMatchmaking = true;
        await this.usersRepository.save(newUser);
    }

    async leaveQueue(playerID: string, gameMode: string) {
        if (gameMode === "NORMAL") {
            this.playersNormalQueue.splice(this.playersNormalQueue.indexOf(playerID), 1);
        }
        else if (gameMode === "SPEED") {
            this.playersSpeedQueue.splice(this.playersSpeedQueue.indexOf(playerID), 1);
        }
        // const newQueue = this.playersNormalQueue.filter((id: string) => id === playerID);
        // this.playersNormalQueue = newQueue;


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
