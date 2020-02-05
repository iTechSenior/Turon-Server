import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chatrooms')
export class ChatRooms {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  requester: string;

  @Column()
  responder: string;

  @Column()
  isReplied: boolean;

  @Column()
  ts: string;
}