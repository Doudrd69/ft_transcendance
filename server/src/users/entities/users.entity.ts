import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';
import { GroupMember } from '../../chat/entities/group_member.entity'
import { Friendship } from './friendship.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  login: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  image: string;

  @Column({ default: false })
  isActive: boolean;

  @ManyToMany(type => GroupMember)
  members: GroupMember[];

  @OneToMany(() => Friendship, (friendship) => friendship.initiator)
  initiatedFriendships: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.friend)
  acceptedFriendships: Friendship[];
}