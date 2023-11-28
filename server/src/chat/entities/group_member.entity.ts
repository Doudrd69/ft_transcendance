import { Entity, Column, ManyToMany, OneToMany, OneToOne, JoinColumn, JoinTable, PrimaryGeneratedColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/users.entity'

@Entity()
export class GroupMember {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(type => User)
  @JoinTable({
	  name: "user_to_conversation",
	  joinColumn: {
		  name: "conversation",
		  referencedColumnName: "id"
	  },
	  inverseJoinColumn: {
		  name: "user",
		  referencedColumnName: "id"
	  }
  })
  users: User[];
  // peut etre mettre conversation ici
  
  @Column({ type: 'timestamptz' }) // Recommended
  joined_datetime: Date;

  @Column({ type: 'timestamptz' }) // Recommended
  left_datetime: Date;
}