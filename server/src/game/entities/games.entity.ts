import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class Game {
	@PrimaryGeneratedColumn()
	gameId: number;

	@Column()
	playerOneID: string;

	@Column()
	playerTwoID: string;

	@Column()
	playerOneLogin: string;

	@Column()
	playerTwoLogin: string;

	@Column()
	scoreOne: number;

	@Column()
	scoreTwo: number;
}
