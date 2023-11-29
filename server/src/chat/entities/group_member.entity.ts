import { Entity, Column, ManyToMany, OneToMany, OneToOne, ManyToOne, JoinColumn, JoinTable, PrimaryGeneratedColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/users.entity'

@Entity()
export class GroupMember {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Conversation)
  conversation: Conversation;

  // @ManyToMany(type => User)
  // @JoinTable({
	//   name: "user_to_conversation",
	//   joinColumn: {
	// 	  name: "user",
	// 	  referencedColumnName: "id"
	//   },
	//   inverseJoinColumn: {
	// 	  name: "conversation",
	// 	  referencedColumnName: "id"
	//   }
  // })
  // users: User[];

  // @ManyToMany(type => Conversation)
  // @JoinTable({
	//   name: "user_to_conversation",
	//   joinColumn: {
	// 	  name: "conversation",
	// 	  referencedColumnName: "id"
	//   },
	//   inverseJoinColumn: {
	// 	  name: "user",
	// 	  referencedColumnName: "id"
	//   }
  // })
  // conversations: Conversation[];
  
  @Column({ type: 'timestamptz' })
  joined_datetime: Date;

  @Column({ type: 'timestamptz' })
  left_datetime: Date;
}