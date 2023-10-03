import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './users.entity';

@Entity()
export class Friendship {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.initiatedFriendships)
  initiator: User;

  @ManyToOne(() => User, (user) => user.acceptedFriendships)
  friend: User;

  @Column({ default: false })
  isAccepted: boolean;
}