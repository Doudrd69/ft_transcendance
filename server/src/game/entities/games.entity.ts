import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class Game
{
	@PrimaryGeneratedColumn()
  	id: number;

	// @Column()
	// players: string[];

	// @Column()
	// scores: number[];

	@Column()
	duration: number;
	
	@Column()
	startTime: Date;
}
