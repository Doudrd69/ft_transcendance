
import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Vector {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'decimal', precision : 7, scale: 4})
    x: number;

    @Column({ type: 'decimal', precision : 7, scale: 4})
    y: number;
}
