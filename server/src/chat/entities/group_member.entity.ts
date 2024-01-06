import { Entity, Column, ManyToMany, OneToMany, OneToOne, ManyToOne, JoinColumn, JoinTable, PrimaryGeneratedColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity()
export class GroupMember {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: true})
  isPublic: boolean;

  // penser a le HASHER
  @Column({ default: "" })
  password: string;

  @ManyToOne(() => Conversation)
  conversation: Conversation;
  
  @Column({ type: 'timestamptz' })
  joined_datetime: Date;

  @Column({ type: 'timestamptz', default: null })
  left_datetime: Date;
}