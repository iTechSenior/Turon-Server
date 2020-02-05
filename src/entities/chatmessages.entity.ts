import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chatmessages')
export class ChatMessages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomID: number;
  
  @Column()
  message: string;
  
  @Column()
  author: string;
  
  @Column()
  ts: string;
  
  @Column()
  isRead: boolean;

  @Column()
  isSystem: boolean;
}