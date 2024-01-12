import { Entity, Column, ManyToMany, OneToMany, OneToOne, ManyToOne, JoinColumn, JoinTable, PrimaryGeneratedColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from 'src/users/entities/users.entity';

@Entity()
export class GroupMember {

  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ default: false })
  isOwner: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false})
  isBan: boolean;

  @Column({ default: false})
  isMute: boolean;

  @ManyToOne(() => Conversation)
  conversation: Conversation;
  
  @Column({ type: 'timestamptz' })
  joined_datetime: Date;

  @Column({ type: 'timestamptz', default: null })
  left_datetime: Date;
}