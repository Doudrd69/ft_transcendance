import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../users/entities/users.entity';

@Entity()
export class MatchmakingQueue
{
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToMany(type => User)

	@JoinTable()
	waitingUsers: User[];
}