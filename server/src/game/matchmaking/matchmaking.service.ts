import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Lobby } from '../entities/lobby.entity';

@Injectable()
export class MatchmakingService {

    constructor(
        @InjectRepository(Lobby)
        private lobbyRepository: Repository<Lobby>,
        @InjectRepository(User)
        private playersRepository: Repository<User>,
        private playersQueue: String[]
      ) {
      }


    async getUserByLogin(loginToSearch: string): Promise<User> {
		return await this.playersRepository.findOne({ where: {login: loginToSearch}});
	}

    async getPlayersPairs()  {
        // Créer des paires
        const pairs = [];
        for (let i = 0; i < this.playersQueue.length - 1; i += 2) {
            pairs.push([this.playersQueue[i], this.playersQueue[i + 1]]);
        }

        return pairs;
    }

    async join(playerId: string) {
        this.playersQueue.push(playerId);
    }

    async checkPlayersPairs() {
        return (this.playersQueue.length >= 2);
    }
    // async createLobby(lobbyName, playerName: string): Promise<Lobby> {
    //     console.log("-- Create Lobby --");
    //     console.log("Lobby ID: ", lobbyName);
    //     console.log("User ID: ", playerName);
    //     const newLobby = this.lobbyRepository.create({name : lobbyName});
    //     this.getUserByLogin(playerName).then(result => {
    //         newLobby.lobbyTable.push(result);
    //     }).catch(error => {
    //         console.log("Error in first promise: ", error);
    //     })
    //     this.lobbyRepository.save(newLobby);
    //     console.log(`The player: ${playerName}, create lobby: ${newLobby.name}.`);
    //     return ;
    // }
    // async checkLobbyAlreadyExist(playerName: string): Promise<Lobby> {
    
    //     const allLobbies = await this.lobbyRepository.find({ relations: ['lobbyTable'] });
        
    //     for (const lobby of allLobbies) {
    //         if (lobby.lobbyTable.length < 2) {
    //             this.getUserByLogin(playerName).then(result => {
    //                 lobby.lobbyTable.push(result);
    //             }).catch(error => {
    //                 console.log("Error in first promise: ", error);
    //             })
    //             await this.lobbyRepository.save(lobby);
    //             console.log(`The player: ${playerName}, join lobby: ${lobby.name}.`);
    //             return ;
    //         }
    //     }

    //     await this.createLobby(playerName + "'s Lobby", playerName);
    //     return ;
    // }

    // async leaveLobby(playerName: string)
    // {
    //     /*
    //     parcourir les lobby et trouver ou est le player, puis le 'depush'
    //     */
        
    //     return ;
    // }

    // async deleteEmptyLobby() 
    // {
    //     return ;
    // }
}

/**
 * mtn il faut que je supprime le lobby des que le joueur qui l'a cree part
 */
