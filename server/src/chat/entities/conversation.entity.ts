import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Conversation {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;
}