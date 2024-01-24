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

    public playersQueue: string[] = [];
	
    async getPlayersPairs()  {
		// Créer des paires
		const pairs: Array<[string, string]> = [];
        for (let i = 0; i < this.playersQueue.length - 1; i += 2) {
            pairs.push([this.playersQueue[i], this.playersQueue[i + 1]]);
			console.log("one pair FIND");
        }
		return pairs;
	}
		

    async join(playerID: string) {
		this.playersQueue.push(playerID);
        const newUser: User = await this.usersRepository.findOne({ where: { socketGame: playerID } })
        console.log(`NewUserSocket: ${playerID}`);
        newUser.inMatchmaking = true;
        await this.usersRepository.save(newUser);
		console.log("player rejoin the queue");
    }

	async leave(playerID: string) {
        const index = this.playersQueue.findIndex(id => id === playerID);
        if (index !== -1) {
            this.playersQueue.splice(index, 1);
            console.log("player leave the queue");
        }
    }

    async IsThereEnoughPairs() {
        return (this.playersQueue.length >= 2);
    }
}


// trouver comment envoyer a seulement deux users pour lancer une partie
