import { Entity, Column, ManyToMany, OneToMany, OneToOne, ManyToOne, JoinColumn, JoinTable, PrimaryGeneratedColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity()
export class GroupMember {

  @PrimaryGeneratedColumn()
  id: number;

<<<<<<< HEAD
  @ManyToOne(() => Conversation)
  conversation: Conversation;
=======
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
>>>>>>> 4265ee7 (Reworked friendship (isse with dto transmission) + trying to implement notifications)
  
  @Column({ type: 'timestamptz' })
  joined_datetime: Date;

  @Column({ type: 'timestamptz', default: null })
  left_datetime: Date;
}