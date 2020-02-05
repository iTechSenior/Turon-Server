import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  university: number;

  @Column()
  zipcode: number;

  @Column()
  password: string;

  @Column()
  google_id: string;

  @Column()
  facebook_id: string;

  @Column()
  linkedin_id: string;

  @Column()
  tutor: string;

  @Column()
  isAdmin: boolean;

  @Column()
  MFA_secret: string;

  @Column()
  MFA_confirmed: boolean;
}