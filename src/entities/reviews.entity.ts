import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Reviews {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column()
  rating: string;
  
  @Column()
  date: Date;

  @Column()
  student: string;

  @Column()
  tutor: string;
}