import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ChatMessages } from './../../entities/chatmessages.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindConditions } from 'typeorm';
import { ChatRooms } from './../../entities/chatrooms.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatRooms) private readonly roomsModel: Repository<ChatRooms>,
        @InjectRepository(ChatMessages) private readonly messagesModel: Repository<ChatMessages>,
    ){}

    async getRooms(query: FindConditions<ChatRooms>){
        return await this.roomsModel.find(query);
    }

    async getRoomById(id: string){
        return await this.roomsModel.findOne(id);
    }

    async createMessage(body: QueryDeepPartialEntity<ChatMessages>){
        return await this.messagesModel.insert(body);
    }
}
