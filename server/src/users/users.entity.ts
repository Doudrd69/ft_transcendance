import { Entity, Column, firstGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @firstGeneratedColumn()
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
}