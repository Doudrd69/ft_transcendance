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
			console.log("Found a socket pair");
        }
		return pairs;
	}

    async join(playerID: string, playerLogin: string) {
        console.log("Push queue before: ", this.playersQueue);
		this.playersQueue.push(playerID);
        console.log("Push queue after: ", this.playersQueue);
        const newUser: User = await this.usersRepository.findOne({ where: { login: playerLogin } })
        console.log(`userIDuniqe: ${newUser.id}`)
        if (!newUser)
            console.log(`No User for this gameSocketId: ${playerID}`);
        newUser.inMatchmaking = true;
        await this.usersRepository.save(newUser);
		console.log(`${newUser.login} joins the queue`);
    }

	async leave(playerID: string) {
        // const index = this.playersQueue.findIndex(id => id === playerID);
        // console.log("coucou from leave 1");
        // if (index !== -1) {
        //     console.log("coucou from leave 1-2");
        //     this.playersQueue.splice(index, 1);
        //     console.log("player leave the queue");
        // }
        console.log("Queue before: ", this.playersQueue);
        const newQueue = this.playersQueue.filter((id: string) => id === playerID);
        this.playersQueue = newQueue;
        console.log("Queue After: ", this.playersQueue);


        return ;
    }

    async IsThereEnoughPairs() {
        return (this.playersQueue.length >= 2);
    }
}


// trouver comment envoyer a seulement deux users pour lancer une partie
