import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm'
import { Message } from './message.entity';
import { GroupMember } from './group_member.entity';

@Entity()
export class Conversation {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	// penser a le HASHER
	@Column({ default: "" })
	password: string;

	@Column({ default: false })
	isProtected: boolean;

	@Column({ default: true})
  	isPublic: boolean;
	
	@Column({ default: false })
	is_channel: boolean;

	// array d'id pour les user mutes
	// quand j'add un mec a une conv je regarde s'il est mute et je reset le status a true
	@Column("int", {
		array: true,
		default: null,
	})
	mutedUsers: number[];

	@OneToMany(() => Message, (message) => message.conversation)
	messages: Message[];
}