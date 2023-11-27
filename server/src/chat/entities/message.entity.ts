import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  from: string;

  @Column()
  content: string;

  @Column() // Recommended
  post_datetime: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;
}