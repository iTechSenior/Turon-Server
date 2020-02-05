import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('courseinfo')
export class CourseInfo {
  @PrimaryGeneratedColumn()
  courseinfoid: number;

  @Column()
  subject: string;

  @Column()
  subjectid: string;
}