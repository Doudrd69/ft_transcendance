import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Lobby } from '../entities/lobby.entity';

@Injectable()
export class LobbyService {
    constructor(
        @InjectRepository(Lobby)
        private lobbyRepository: Repository<Lobby>,
        @InjectRepository(User)
            private playersRepository: Repository<User>,
      ) {}


    async getUserByLogin(loginToSearch: string): Promise<User> {
		return await this.playersRepository.findOne({ where: {login: loginToSearch}});
	}
    async createLobby(lobbyName, player: User): Promise<Lobby> {
        console.log("-- Create Lobby --");
        console.log("Lobby ID: ", lobbyName);
        console.log("User ID: ", player.login);
        const newLobby = this.lobbyRepository.create({name : lobbyName});
        this.getUserByLogin(player.login).then(result => {
            newLobby.lobbyTable.push(result);
        }).catch(error => {
            console.log("Error in first promise: ", error);
        })
        this.lobbyRepository.save(newLobby);
        console.log(`The player: ${player.login}, create lobby: ${newLobby.name}.`);
        return ;
    }
    async checkLobbyAlreadyExist(player: User): Promise<Lobby> {
    
        const allLobbies = await this.lobbyRepository.find({ relations: ['lobbyTable'] });
        
        for (const lobby of allLobbies) {
            if (lobby.lobbyTable.length < 2) {
                this.getUserByLogin(player.login).then(result => {
                    lobby.lobbyTable.push(result);
                }).catch(error => {
                    console.log("Error in first promise: ", error);
                })
                await this.lobbyRepository.save(lobby);
                console.log(`The player: ${player.login}, join lobby: ${lobby.name}.`);
                return ;
            }
        }

        await this.createLobby(player.login + "'s Lobby", player);
        return ;
    }
}

/**
 * Pour check le lobby
 * regarder tout les lobbys et regarder leurs tailles
 * pour creer un lobby
 */
