import { CollegeService } from './../../services/college/college.service';
import { Controller, Get } from '@nestjs/common';

@Controller('college')
export class CollegeController {
    constructor(
        private collegeService: CollegeService
    ){}

    @Get('')
    async getColleges(){
        return await this.collegeService.getColleges();
    }
}
