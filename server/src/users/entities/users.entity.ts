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

  @Column({default: "guest"})
  username: string;

  @Column()
  image: string;

  @Column({default: ""})
  TFA_secret: string;

  @Column({default: ""})
  TFA_temp_secret: string;

  @Column()
  socket: number;

  @Column({ default: false })
  isActive: boolean;

  @ManyToMany(type => GroupMember)
  members: GroupMember[];

  @OneToMany(() => Friendship, (friendship) => friendship.initiator)
  initiatedFriendships: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.friend)
  acceptedFriendships: Friendship[];
}