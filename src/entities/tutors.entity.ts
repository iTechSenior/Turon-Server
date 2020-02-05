import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tutors {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fees: number;
  
  @Column()
  about: string;
  
  @Column()
  phone: string;
  
  @Column()
  profile: string;
  
  @Column()
  live_near_school: boolean;
  
  @Column()
  online_tutoring: boolean;
  
  @Column()
  travel: number;
  
  @Column()
  experience: number;
  
  @Column()
  day_0_start: string;
  
  @Column()
  day_0_end: string;
  
  @Column()
  day_1_start: string;
  
  @Column()
  day_1_end: string;
  
  @Column()
  day_2_start: string;
  
  @Column()
  day_2_end: string;
  
  @Column()
  day_3_start: string;
  
  @Column()
  day_3_end: string;
  
  @Column()
  day_4_start: string;
  
  @Column()
  day_4_end: string;
  
  @Column()
  day_5_start: string;
  
  @Column()
  day_5_end: string;
  
  @Column()
  day_6_start: string;
  
  @Column()
  day_6_end: string;
}