
import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';
import { Vector } from './vector.entity';


@Entity()
export class Ball {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'jsonb' })
    position: Vector;

    @Column({ type: 'jsonb' })
    speed: Vector;
}
