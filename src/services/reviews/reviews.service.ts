import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { Reviews } from './../../entities/reviews.entity';
import { Injectable } from '@nestjs/common';
import { Repository, FindConditions } from 'typeorm';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Reviews) private readonly reviewsModel: Repository<Reviews>,        
    ){}

    async getReviews(query: FindConditions<Reviews>){
        return await this.reviewsModel.find(query); 
    }

    async createReview(body: QueryDeepPartialEntity<Reviews>){
        return await this.reviewsModel.insert(body);
    }
}
