import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentType } from '../interfaces/Payments';

@Entity()
export class Payments {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  paymentid: string;

  @Column()
  date: string;

  @Column()
  userid: string;

  @Column()
  amount: number;

  @Column()
  fees: number;

  @Column()
  type: PaymentType;

  @Column()
  payment_email: string;
}