import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm'
import { Message } from './message.entity';
import { GroupMember } from './group_member.entity';

@Entity()
export class Conversation {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;
	
	@Column({ default: false })
	is_channel: boolean;

	@OneToMany(() => Message, (message) => message.conversation)
	messages: Message[];
}