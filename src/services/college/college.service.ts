import { Colleges } from '../../entities/colleges.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CollegeService {
    constructor(
        @InjectRepository(Colleges) private readonly collegeModel: Repository<Colleges>,
    ){}

    async getColleges(){
        return await this.collegeModel.find();
    }
}
