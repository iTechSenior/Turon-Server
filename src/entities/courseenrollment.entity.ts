import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('courseenrollment')
export class CourseEnrollment {
  @PrimaryGeneratedColumn()
  courseenrollmentid: number;

  @Column()
  teacherid: string;

  @Column()
  date: Date;

  @Column()
  courseinfoid: string;
}