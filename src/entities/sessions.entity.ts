import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sessions {
  @PrimaryGeneratedColumn()
  sessionid: string;

  @Column()
  studentid: string;

  @Column()
  teacherid: string;

  @Column()
  courseenrollmentid: number;

  @Column()
  date: string;

  @Column()
  acceptedByStudent: boolean;

  @Column()
  acceptedByTeacher: boolean;

  @Column()
  location: string;

  @Column()
  message: string;

  @Column()
  price: number;

  @Column()
  status: string;

  @Column()
  roomid: number;
}