import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Transactions {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  sessionid: string;

  @Column()
  price: number;

  @Column()
  date: string;

  @Column()
  status: number;

  @Column()
  tutorid: string;

  @Column()
  userid: string;
}