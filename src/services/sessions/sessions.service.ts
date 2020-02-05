import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Sessions } from './../../entities/sessions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, FindConditions } from 'typeorm';
import * as sqlstring from 'sqlstring';
import { Session } from 'inspector';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(Sessions) private readonly sessionsModel: Repository<Sessions>,        
    ){}

    async getSessions(field: string, value: string){
        return await this.sessionsModel.query(`
            SELECT a.*, b.firstName, b.lastName, b.tutor, b.id as userid FROM sessions a
            LEFT JOIN user b ON a.${field === 'studentid' ? 'teacherid' : 'studentid'} = b.id
            WHERE ${field} = ${sqlstring.escape(value)}
            ORDER BY date DESC
        `);
    }

    async getSessionById(id: string){
        return (await this.sessionsModel.query(`
            SELECT e.subject, a.*, b.firstName as teacherFirstName, b.lastName as teacherLastName, c.firstName as studentFirstName, c.lastName as studentLastName FROM sessions a
            LEFT JOIN user b ON a.teacherid = b.id
            LEFT JOIN user c ON a.studentid = c.id
            LEFT JOIN courseenrollment d on a.courseenrollmentid = d.courseenrollmentid
            LEFT JOIN courseinfo e on d.courseinfoid = e.courseinfoid
            WHERE a.sessionid = ${sqlstring.escape(id)}
        `))[0];
    }

    async createSession(body: QueryDeepPartialEntity<Sessions>){
        const {identifiers} = await this.sessionsModel.insert({...body});

        return await this.sessionsModel.findOne(identifiers[0].sessionid);
    }

    updateSession = async (id: string, body: QueryDeepPartialEntity<Sessions>) => await this.sessionsModel.update(id, body);
}
