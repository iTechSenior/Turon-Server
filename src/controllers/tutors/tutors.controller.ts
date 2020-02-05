import { AwsService } from './../../services/aws/aws.service';
import { CourseInfoService } from './../../services/courseinfo/courseinfo.service';
import { UserService } from './../../services/user/user.service';
import { TutorsService } from './../../services/tutors/tutors.service';
import { Controller, Get, HttpStatus, Response, Query, Res, Param, Delete, Post, Body } from '@nestjs/common';
import * as _ from 'lodash';
import * as sqlstring from 'sqlstring';
import * as validator from 'validator';
import * as uuidv1 from 'uuid/v1';

@Controller('tutors')
export class TutorsController {
    constructor(
        private tutorsService: TutorsService,
        private userService: UserService,
        private courseinfoService: CourseInfoService,
        private awsService: AwsService
    ){}

    @Get('')
    async getTutors(
        @Response() res,
        @Query('schools') schools,
        @Query('q') query,
        @Query('free') free,
        @Query('minPrice') minPrice,
        @Query('maxPrice') maxPrice,
        @Query('type') type,
        @Query('schedule') schedule,
        @Query('physicalLocation') physicalLocation

    ){
        try{
            const request = {
                query: '',
                schools: '',
                limit: 30,
                filters: []
            };

            if(query){
                request.query = _.replace(String.prototype.trim.call(query), ' ', '%');
            }

            if(schools){
                request.schools = schools.split(',');
            }

            if(free == 'true'){
                request.filters.push(`fees = '0'`);
            }else{
                if(minPrice && !Number.isNaN(parseInt(minPrice))){
                    request.filters.push(`fees >= ${sqlstring.escape(parseInt(minPrice))}`);
                }
                if(maxPrice && !Number.isNaN(parseInt(maxPrice))){
                    request.filters.push(`fees <= ${sqlstring.escape(parseInt(maxPrice))}`);
                }
            }

            if(type === 'person'){
                request.filters.push(`live_near_school = 1`);
            }else if(type === 'online'){
                request.filters.push(`online_tutoring = 1`);
            }

            if(physicalLocation === 'true'){
                request.filters.push(`email like '%@turon.co%'`);
            }

            if(schedule){
                const days = _.split(schedule, '|');
    
                if(days && days.length === 7){
                    const scheduleFilters = _.filter(_.map(days, (v, i) => {
                        if(v === '-'){
                            return;
                        }
    
                        return `(day_${i}_start >= ${sqlstring.escape(_.first(_.split(days[i], '-')))} and day_${i}_end <= ${sqlstring.escape(_.last(_.split(days[i], '-')))})`;
                    }), _.identity).join(' or ');
    
    
                    if(scheduleFilters.length !== 0){
                        request.filters.push(`(${scheduleFilters})`);
                    }
                }
            }

            const tutors = await this.tutorsService.getTutors(request);

            return res.status(HttpStatus.OK).json(tutors);

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Get(':id')
    async getTutorById(
        @Response() res,
        @Param('id') id
    ){
        try{
            const tutor = await this.tutorsService.getTutorById(id);

            if(!tutor || !tutor.length){
                throw Error('Could not find the tutor.');
            }

            return res.status(HttpStatus.OK).json(tutor[0]);

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Get(':id/courses')
    async getTutorCoursesById(
        @Response() res,
        @Param('id') id
    ){
        try{
            const courses = await this.tutorsService.getTutorCoursesById(id);
                    
            return res.status(HttpStatus.OK).send(courses);
        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Delete(':id')
    async deleteTutor(
        @Response() res,
        @Param('id') id
    ){
        try{
            const user = await this.userService.findUserById(id);

            if(!user){
                throw Error('Unknown user.');;
            }

            await this.userService.updateUser(id, {tutor: null});
            await this.tutorsService.deleteTutor(user);

            return res.status(200).send({success: true});

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Post(':id')
    async createTutor(
        @Response() res,
        @Body() body,
        @Param('id') id
    ){
        try{
            if(!(body.about && body.profile && body.phone)){
                throw Error('Form is invalid.');
            }

            if(Number.isNaN(+body.fees) || +body.fees < 0){
                throw Error('Fees field has to be positive float.');
            }

            if(!validator.isMobilePhone(body.phone, ['en-US'])){
                throw Error('Please enter valid US phone numbre.');
            }

            if(!body.schedule){
                throw Error('Schedule is required field.');
            }

            if(Number.isNaN(parseInt(body.experience)) || parseInt(body.experience) > 5){
                throw Error('Experience is required field.')
            }
    
            if(!Array.isArray(body.schedule) || body.schedule.length !== 7){
                throw Error('Schedule is invalid.');
            }
    
            if(!Array.isArray(body.courses) || body.courses.length === 0){
                throw Error('Courses field is invalid.');
            }

            const schedule = _.map(body.schedule, (day) => {
                if(day.unavailable){
                    return ['', ''];
                }
    
                if(!day.startTime || !day.endTime){
                    throw Error('Invalid day object.');
                }
    
                if(!/^[0-2][0-9]:[0-5]\d$/gi.test(day.startTime)){
                    throw Error('Invalid day startTime.');
                }
    
                if(!/^[0-2][0-9]:[0-5]\d$/gi.test(day.endTime)){
                    throw Error('Invalid day endTime.');
                }
    
                return [day.startTime, day.endTime];
            });

            const scheduleUpdateMap = {};
    
            for(let i = 0; i < schedule.length; i++){
                Object.defineProperty(scheduleUpdateMap, `day_${i}_start`, {
                    writable: true,
                    enumerable: true,
                    value: schedule[i][0]
                })

                Object.defineProperty(scheduleUpdateMap, `day_${i}_end`, {
                    writable: true,
                    enumerable: true,
                    value: schedule[i][1]
                })
            }
    
            for(let item of body.courses){
                if(!item.subject || !item.id){
                    throw Error('Unknown course.');
                }
    
                if(!validator.isInt(_.toString(item.id)) || +_.toString(item.id) <= 0){
                    throw Error('Course ID has to be positive integer.');
                }

                const courseData = await this.courseinfoService.getCourseById(item.id);

                if(!courseData){
                    throw Error('Course not found.');
                }
            }

            const user = await this.tutorsService.getTutorById(id);


            const profile = _.startsWith(body.profile, 'data:image/') ? await this.awsService.uploadPicture(body.profile) : body.profile;

            if(user.length){
                if(!body.firstName){
                    throw Error('First name is required field.');
                }

                if(!body.lastName){
                    throw Error('Last name is required field.');
                }

                if(!body.zipcode){
                    throw Error('Zip Code is required field.');
                }

                await this.userService.updateUser(id, {
                    firstName: body.firstName,
                    lastName: body.lastName,
                    zipcode: body.zipcode
                })

                await this.tutorsService.updateTutor(user[0].tutorid, _.assign({}, scheduleUpdateMap, {
                    experience: body.experience,
                    fees: body.fees,
                    travel: body.travel,
                    about: body.about,
                    phone: body.phone,
                    profile: profile,
                    live_near_school: body.live_near_school,
                    online_tutoring: body.online_tutoring
                }));

                await this.courseinfoService.deleteCourseEnrollmentsByTeacherId(id);
            }else{
                const tutorid = uuidv1();

                await this.tutorsService.createTutor(_.assign({}, scheduleUpdateMap, {
                    id: tutorid,
                    fees: body.fees,
                    travel: body.travel,
                    about: body.about,
                    profile: profile,
                    phone: body.phone,
                    live_near_school: body.live_near_school,
                    online_tutoring: body.online_tutoring,
                    experience: body.experience
                }));

                await this.userService.updateUser(id, {
                    tutor: tutorid
                })
            }

            for(let item of body.courses){
                await this.courseinfoService.createCourseEnrollment({
                    courseinfoid: item.id,
                    teacherid: id
                })
            }

            return res.status(HttpStatus.OK).json(id);
        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }
}