
import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';
import { Vector } from './vector.entity';


@Entity()
export class Ball {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    x: number;

    @Column()
    y: number;

    @Column({ type: 'decimal', precision : 7, scale: 4})
    r: number;

    @Column({ type: 'jsonb' })
    speed: Vector;
}
