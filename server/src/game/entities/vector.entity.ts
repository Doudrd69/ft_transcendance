
import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Vector {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    x: number;

    @Column()
    y: number;
}
