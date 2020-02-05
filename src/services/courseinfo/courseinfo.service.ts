import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CourseEnrollment } from './../../entities/courseenrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CourseInfo } from '../../entities/courseinfo.entity';
import { Repository, Like } from 'typeorm';
import * as moment from 'moment';

@Injectable()
export class CourseInfoService {
    constructor(
        @InjectRepository(CourseInfo) private readonly courseModel: Repository<CourseInfo>,
        @InjectRepository(CourseEnrollment) private readonly enrollmentModel: Repository<CourseEnrollment>,
    ){}

    async getCourseById(id: string){
        return await this.courseModel.findOne(id);
    }

    async getCoursesBySubjectId(sid: string){
        return await this.courseModel.find({
            subjectid: sid
        })
    }

    async getEnrollmentById(id: string){
        return await this.enrollmentModel.findOne(id);
    }

    async getCoursesByQuery(q: string){
        const query: any = {};

        if(q){
            query.subject = Like(`%${q}%`);
        }

        return await this.courseModel.find(query);
    }

    async deleteCourseEnrollmentsByTeacherId(id: string){
        return await this.enrollmentModel.delete({
            teacherid: id
        });
    }

    async createCourseEnrollment(body: any){
        return await this.enrollmentModel.insert({
            ...body,
            date: moment().format('YYYY-MM-DD HH:mm:ss')
        })
    }
}
