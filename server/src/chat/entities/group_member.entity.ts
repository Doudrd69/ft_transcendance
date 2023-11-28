import { Entity, Column, ManyToMany, OneToMany, OneToOne, JoinColumn, JoinTable, PrimaryGeneratedColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/users.entity'

@Entity()
export class GroupMember {

  @PrimaryGeneratedColumn()
  id: number;

  //FK to conversation_id
//   @OneToMany(type => Conversation, conversation => conversation.id)
//   conversation: Conversation[];
	@OneToOne(() => Conversation)
	conversation: Conversation;

  //FK vers USER id
  @ManyToMany(type => User)
  @JoinTable({
	  name: "group_relation", // table name for the junction table of this relation
	  joinColumn: {
		  name: "user",
		  referencedColumnName: "id"
	  },
	  inverseJoinColumn: {
		  name: "conversation",
		  referencedColumnName: "id"
	  }
  })
  user: User[];
  
  @Column({ type: 'timestamptz' }) // Recommended
  joined_datetime: Date;

  @Column({ type: 'timestamptz' }) // Recommended
  left_datetime: Date;
}