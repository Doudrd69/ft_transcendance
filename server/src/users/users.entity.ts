import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { GroupMember } from '../chat/entities/group_member.entity'

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
}