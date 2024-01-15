import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';
import { Game } from './games.entity';
import { Paddle } from './paddle.entity';
import { Ball } from './ball.entity';

@Entity()
export class GameEngine {
	@PrimaryGeneratedColumn()
	gameEngineId: number;

	@Column({default: 5})
	gameID: number;

	@Column({default: 5})
	victory_condition: number;

	@Column()
	playerOneID: string;

	@Column()
	playerTwoID: string;

	@Column()
	scoreOne: number;

	@Column()
	scoreTwo: number;
}
