import { User } from './../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userModel: Repository<User>,
    ){}

    async findUserByEmail(email: string){
        return await this.userModel.findOne({email: email});
    }

    async updateUser(id: string, body: QueryDeepPartialEntity<User>){
        await this.userModel.update(id, body);

        return await this.userModel.findOne(id);
    }

    findUserById = async (id: string) => await this.userModel.findOne(id);
}
