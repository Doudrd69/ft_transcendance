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
	
    async getPlayersPairsNormalQueue()  {
		// Créer des paires
		const pairs: Array<[string, string]> = [];
        for (let i = 0; i < this.playersNormalQueue.length - 1; i += 2) {
            pairs.push([this.playersNormalQueue[i], this.playersNormalQueue[i + 1]]);
			console.log("Found a socket pair");
        }
		return pairs;
	}

    async joinNormalQueue(playerID: string, playerLogin: string) {
        console.log("Push queue before: ", this.playersNormalQueue);
		this.playersNormalQueue.push(playerID);
        console.log("Push queue after: ", this.playersNormalQueue);
        const newUser: User = await this.usersRepository.findOne({ where: { login: playerLogin } })
        if (!newUser)
            console.log(`No User for this gameSocketId: ${playerID}`);
        newUser.inMatchmaking = true;
        await this.usersRepository.save(newUser);
    }

	async leaveNormalQueue(playerID: string) {
        // const index = this.playersNormalQueue.findIndex(id => id === playerID);
        // console.log("coucou from leave 1");
        // if (index !== -1) {
        //     console.log("coucou from leave 1-2");
        //     this.playersNormalQueue.splice(index, 1);
        //     console.log("player leave the queue");
        // }
        console.log("Queue before: ", this.playersNormalQueue);
        this.playersNormalQueue.splice(this.playersNormalQueue.indexOf(playerID), 1);
        // const newQueue = this.playersNormalQueue.filter((id: string) => id === playerID);
        // this.playersNormalQueue = newQueue;
        console.log("Queue After: ", this.playersNormalQueue);


        return ;
    }

    async IsThereEnoughPairs() {
        return (this.playersNormalQueue.length >= 2);
    }
}


// trouver comment envoyer a seulement deux users pour lancer une partie
