import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchmakingQueue } from './entities/matchmaking_queue.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(MatchmakingQueue)
    private matchmakingRepository: Repository<MatchmakingQueue>,
  ) {}

  async addPlayerToQueue(player: User): Promise<void> {
    const matchmakingQueue = await this.matchmakingRepository.findOne();
    matchmakingQueue.waitingUsers = [...matchmakingQueue.waitingUsers, player];
    await this.matchmakingRepository.save(matchmakingQueue);
  }

  async matchPlayers(): Promise<[User, User] | null> {
    const matchmakingQueue = await this.matchmakingRepository.findOne();
    if (matchmakingQueue.waitingUsers.length >= 2) {
      const player1 = matchmakingQueue.waitingUsers.shift();
      const player2 = matchmakingQueue.waitingUsers.shift();
      await this.matchmakingRepository.save(matchmakingQueue);
      return [player1, player2];
    }
    return null;
  }
}