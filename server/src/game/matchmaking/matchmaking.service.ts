import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MatchmakingService {

    public playersQueue: string[] = [];
	
    async getPlayersPairs()  {
		// Créer des paires
		const pairs: Array<[string, string]> = [];
        for (let i = 0; i < this.playersQueue.length - 1; i += 2) {
            pairs.push([this.playersQueue[i], this.playersQueue[i + 1]]);
			console.log("one pair FIND");
        }
		return pairs;
        // return new Promise((resolve, reject) => {
		// 	if (pairs.length >= 2) {
		// 	  resolve(pairs);
		// 	} else {
		// 	  reject('Not enough players');
		// 	}
		// });
	}
		

    async join(playerLogin: string) {
		this.playersQueue.push(playerLogin);
		console.log("player rejoin the queue");
    }

	async leave(playerLogin: string) {
        const index = this.playersQueue.findIndex(login => login === playerLogin);
        if (index !== -1) {
            this.playersQueue.splice(index, 1);
            console.log("player leave the queue");
        }
    }

    async IsThereEnoughPairs() {
        return (this.playersQueue.length >= 2);
    }
}
