
import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Paddle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    width: number;

    @Column({ default: false})
    up: boolean;

    @Column({ default: false})
    down: boolean;

    @Column()
    height: number;

    @Column({ type: 'decimal', precision : 7, scale: 4})
    x_pos: number;

    @Column({ type: 'decimal', precision : 7, scale: 4})
    y_pos: number;

    @Column({ type: 'decimal', precision : 7, scale: 4, default: 55/60})
    speed: number;
}
