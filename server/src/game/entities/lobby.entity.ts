import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/users.entity';

@Entity()
export class Lobby
{
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@ManyToMany(type => User)

	@JoinTable()
	lobbyTable: User[];
}
