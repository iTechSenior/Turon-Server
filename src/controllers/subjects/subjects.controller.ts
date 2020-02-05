import { CourseInfoService } from './../../services/courseinfo/courseinfo.service';
import { Controller, Get, Query, Response, Param } from '@nestjs/common';
import validator from 'validator';

@Controller('subjects')
export class SubjectsController {
    constructor(
        private courseinfoService: CourseInfoService
    ){}

    @Get('')
    async getSubjects(
        @Query('q') q
    ){
        return await this.courseinfoService.getCoursesByQuery(q);
    }
}