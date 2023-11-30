import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable, JoinColumn, } from 'typeorm';
import { Friendship } from './friendship.entity';
import { GroupMember } from 'src/chat/entities/group_member.entity';

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

  @Column({ default: false })
  isActive: boolean;

  @ManyToMany(type => Conversation)
  @JoinTable({
	  name: "user_to_group",
	  joinColumn: {
		  name: "user",
		  referencedColumnName: "id"
	  },
	  inverseJoinColumn: {
		  name: "group",
		  referencedColumnName: "id"
	  }
  })
  groups: GroupMember[];

  @OneToMany(() => Friendship, (friendship) => friendship.initiator)
  initiatedFriendships: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.friend)
  acceptedFriendships: Friendship[];
}