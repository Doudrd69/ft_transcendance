import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm'
import { Message } from './message.entity';
import { GroupMember } from './group_member.entity';

@Entity()
export class Conversation {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	// @OneToOne(() => GroupMember)
	// group_member: GroupMember;

	@OneToMany(() => Message, (message) => message.conversation)
	messages: Message[];
  
}