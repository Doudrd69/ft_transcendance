import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable, JoinColumn, } from 'typeorm';
import { Friendship } from './friendship.entity';
import { GroupMember } from 'src/chat/entities/group_member.entity';
import { Conversation } from 'src/chat/entities/conversation.entity';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ default: "1234" })
	socketGame: string;


  @Column({ default: false })
  inGame: boolean;

  @Column()
  login: string;

	@Column()
	firstname: string;

	@Column({ default: "guest" })
	username: string;

	@Column({ default: "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/corporate-user-icon.png" })
	avatarURL: string;

	@Column()
	officialProfileImage: string;

	@Column({ default: "" })
	TFA_secret: string;

	@Column({ default: "" })
	TFA_temp_secret: string;

	@Column({ default: false })
	TFA_isEnabled: boolean;

	@Column({ default: false })
	isActive: boolean;

	@ManyToMany(type => Conversation, {
		eager: true,
	})
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

	@OneToMany(() => Friendship, (friendship) => friendship.initiator, {
		eager: true,
	})
	initiatedFriendships: Friendship[];

	@OneToMany(() => Friendship, (friendship) => friendship.friend, {
		eager: true,
	})
	acceptedFriendships: Friendship[];
}