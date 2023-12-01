import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable, JoinColumn, } from 'typeorm';
import { Friendship } from './friendship.entity';
import { Conversation } from 'src/chat/entities/conversation.entity';

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

  @ManyToMany(type => Conversation)
  @JoinTable({
	  name: "user_to_conversation",
	  joinColumn: {
		  name: "user",
		  referencedColumnName: "id"
	  },
	  inverseJoinColumn: {
		  name: "conversation",
		  referencedColumnName: "id"
	  }
  })
  conversations: Conversation[];

  @OneToMany(() => Friendship, (friendship) => friendship.initiator)
  initiatedFriendships: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.friend)
  acceptedFriendships: Friendship[];
}