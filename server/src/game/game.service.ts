import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Lobby } from './entities/lobby.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Lobby)
    private lobbyRepository: Repository<Lobby>,
    @InjectRepository(User)
		private playersRepository: Repository<User>,
  ) {}
}