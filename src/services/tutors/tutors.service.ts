import { User } from './../../entities/user.entity';
import { CourseEnrollment } from '../../entities/courseenrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Tutors } from './../../entities/tutors.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as sqlstring from 'sqlstring';
import * as _ from 'lodash';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

var now = require("performance-now");

@Injectable()
export class TutorsService {
    constructor(
        @InjectRepository(Tutors) private readonly tutorsModel: Repository<Tutors>,
        @InjectRepository(CourseEnrollment) private readonly courseenrollmentModel: Repository<CourseEnrollment>,        
    ){}

    async getTutors({query, filters, schools, limit}: {query?: string, filters?: string[], schools?: string, limit?: number}){        
        let tutors = await this.tutorsModel.query(`SELECT
            IF(profile != '/assets/default_profile.png', 1, 0) as custom_profile,
            profile, a.courseinfoid, live_near_school, online_tutoring, c.university, fees, zipcode as zip, about, CONCAT(firstName, ' ', LEFT(lastname, 1), '.') as name, subject, course, subjectid, courseenrollmentid, tutor as tutorid, c.id, email
            FROM courseinfo a JOIN courseenrollment b on a.courseinfoid = b.courseinfoid
            JOIN user c on b.teacherid = c.id
            JOIN tutors d on c.tutor = d.id
            WHERE (${_.map(_.split(query, '%'), v => `subject like ${sqlstring.escape(`%${v}%`)}`).join(' and ')})${schools ? `
            and university in (${_.join(_.map(schools, v => sqlstring.escape(v)), ', ')})` : ''}
            ${filters && filters.length ? `and ${filters.join(' and ')}` : ''}
            ORDER BY custom_profile desc, RAND()
            LIMIT 0,${limit}`);

        if(tutors.length){
            tutors = _.map(_.groupBy(tutors, v => v.tutorid), (v) => {
                return {
                    id: v[0].id,
                    tutorid: v[0].tutorid,
                    email: v[0].email,
                    name: `${_.startCase(v[0].name)}.`,
                    profile: v[0].profile,
                    live_near_school: v[0].live_near_school,
                    online_tutoring: v[0].online_tutoring,
                    about: v[0].about,
                    fees: v[0].fees,
                    zip: v[0].zip,
                    subjects: v.map((k) => {
                        return {
                            courseinfoid: k.courseinfoid,
                            subject: k.subject,
                            courseenrollmentid: k.courseenrollmentid,
                            subjectid: k.subjectid,
                            course: k.course
                        }
                    })
                }
            });
        }

        return tutors;
    }

    async getTutorById(id: string){
        return await this.tutorsModel.query(`
            SELECT
            CONCAT(day_0_start, '-', day_0_end, '|', day_1_start, '-', day_1_end, '|', day_2_start, '-', day_2_end, '|', day_3_start, '-', day_3_end, '|', day_4_start, '-', day_4_end, '|', day_5_start, '-', day_5_end, '|', day_6_start, '-', day_6_end) as schedule,    
            a.id as tutorid, experience, online_tutoring, travel, live_near_school, b.id, fees, phone, about, profile, email, firstName, lastName, university, zipcode
            FROM tutors a
            JOIN user b on a.id = b.tutor 
            WHERE a.id = ${sqlstring.escape(id)} or b.id = ${sqlstring.escape(id)}
        `);
    }

    async getTutorCoursesById(id: string){
        return await this.courseenrollmentModel.query(`
            SELECT
            a.courseenrollmentid, teacherid, date, a.courseinfoid, subject, subjectid
            FROM courseenrollment a
            JOIN courseinfo b ON a.courseinfoid = b.courseinfoid
            WHERE teacherid = ${sqlstring.escape(id)}
        `);
    }

    deleteTutor = async({id, tutor}) => {
        await this.courseenrollmentModel.delete({teacherid: id});
        
        return await this.tutorsModel.delete(tutor);
    };

    async updateTutor(id: string, body: QueryDeepPartialEntity<Tutors>){
        await this.tutorsModel.update(id, body);

        return await this.tutorsModel.findOne(id);
    }

    async createTutor(body){
        return await this.tutorsModel.insert(body);
    }
}



