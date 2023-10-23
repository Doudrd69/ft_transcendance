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
  officialProfileImage: string;

  @Column({ type: 'bytea', default: null, nullable: true })
  avatarImage: Buffer;

  @Column({default: ""})
  TFA_secret: string;

  @Column({default: ""})
  TFA_temp_secret: string;

  @Column({default: false})
  TFA_isEnabled: boolean;

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