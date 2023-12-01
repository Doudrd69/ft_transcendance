import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm'
import { Message } from './message.entity';

@Entity()
export class Conversation {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@OneToMany(() => Message, (message) => message.conversation)
	messages: Message[];
  
}