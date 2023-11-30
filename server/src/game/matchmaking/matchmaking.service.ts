import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Lobby } from '../entities/lobby.entity';

@Injectable()
export class MatchmakingService {
  constructor(
    @InjectRepository(Lobby)
    private matchmakingRepository: Repository<Lobby>,
  ) {}
}