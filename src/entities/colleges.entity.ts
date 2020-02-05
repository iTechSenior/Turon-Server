import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Colleges {
  @PrimaryGeneratedColumn()
  collegeid: number;

  @Column()
  college: string;
}