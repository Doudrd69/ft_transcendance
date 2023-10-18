import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class GameData
{
	@PrimaryGeneratedColumn()
  	id: number;

	@Column()
	player1: string;

	@Column()
	player2: string;

	@Column()
	score1: number;

	@Column()
	score2: number;

	@Column()
	duration: number;
	
	@Column()
	startTime: Date;
}
