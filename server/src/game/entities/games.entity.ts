import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class Game
{
	@PrimaryGeneratedColumn()
  	gameId: number;

	@Column()
	playerOne: string;

	@Column()
	playerTwo: string;

	@Column()
	scoreOne: number;

	@Column()
	scoreTwo: number;
}
