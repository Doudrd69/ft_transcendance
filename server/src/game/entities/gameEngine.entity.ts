import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';
import { Game } from './games.entity';
import { Ball } from '../gameObject/ball';
import { Paddle } from '../gameObject/paddle';

@Entity()
export class GameEngine {
	@PrimaryGeneratedColumn()
	gameEngineId: number;

	@Column()
	gameID: number;

	@Column({ type: 'jsonb' })
	ball: Ball;

	@Column('jsonb', { nullable: true })
	Paddles: Paddle[];

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
