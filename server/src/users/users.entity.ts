import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}