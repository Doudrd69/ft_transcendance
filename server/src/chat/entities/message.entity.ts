import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  from_login: string;

  @Column()
  content: string;

  @Column({ type: 'timestamptz' }) // Recommended
  post_datetime: Date;

  @OneToOne(() => Conversation)
  @JoinColumn()
  conversation: Conversation;
}