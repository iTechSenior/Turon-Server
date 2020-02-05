import { PaymentStatus, PaymentType } from './../../interfaces/Payments';
import { ExternalService } from './../../services/external/external.service';
import { TransactionsService } from './../../services/transactions/transactions.service';
import { UserService } from './../../services/user/user.service';
import { ChatService } from './../../services/chat/chat.service';
import { CourseInfoService } from './../../services/courseinfo/courseinfo.service';
import { TutorsService } from './../../services/tutors/tutors.service';
import { SessionsService } from './../../services/sessions/sessions.service';
import { Controller, UseGuards, HttpStatus, Response, Request, Post, Body, Get, Param, Put, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as moment from 'moment';
import * as _ from 'lodash';

@Controller('sessions')
export class SessionsController {
    constructor(
        private sessionsService: SessionsService,
        private tutorsService: TutorsService,
        private courseinfoService: CourseInfoService,
        private chatService: ChatService,
        private userService: UserService,
        private transactionsService: TransactionsService,
        private externalService: ExternalService
    ){}

    @Get()
    @UseGuards(AuthGuard())
    async getSessions(
        @Request() req,
        @Response() res
    ){
        try{
            const user = await this.userService.findUserById(req.user.id);

            const sessions = await this.sessionsService.getSessions(user.tutor ? 'teacherid' : 'studentid', user.id);

            return res.status(HttpStatus.OK).json(sessions);

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Get(':id')
    @UseGuards(AuthGuard())
    async getSingleSession(
        @Response() res,
        @Param('id') id
    ){
        try{
            const session = await this.sessionsService.getSessionById(id);

            if(!session){
                throw Error('Could not find the session');
            }

            return res.status(HttpStatus.OK).json(session);

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Post()
    @UseGuards(AuthGuard())
    async createSession(
        @Response() res,
        @Request() req,
        @Body() body
    ){
        try{
            if(!body.teacher){
                throw Error('Tutor ID is not defined.');
            }

            const tutor = await this.tutorsService.getTutorById(body.teacher);

            if(!tutor || !tutor.length){
                throw Error('Unknown tutor. Please try again.')
            }

            if(!body.roomid){
                throw Error('Room ID is not defined.');
            }

            if(!body.location || !body.message){
                throw Error('Location or message is invalid.');
            }

            if(!body.enrollment){
                throw Error('Enrollment ID is not defined.');
            }

            const enrollment = await this.courseinfoService.getEnrollmentById(body.enrollment);

            if(!enrollment){
                throw Error('Enrollment ID is invalid.');
            }

            if(!body.time || !moment(body.time).isValid()){
                throw Error('Time is invalid or missing.');
            }

            if(moment(body.time).isBefore(new Date)){
                throw Error('Time has to be set in the future.');
            }

            const room = await this.chatService.getRoomById(body.roomid);

            if(!room){
                throw Error('Chat room is invalid.');
            }

            const session: any = await this.sessionsService.createSession({
                roomid: body.roomid,
                teacherid: body.teacher,
                studentid: req.user.id,
                acceptedByStudent: false,
                acceptedByTeacher: false,
                date: body.time,
                courseenrollmentid: enrollment.courseenrollmentid,
                location: body.location,
                message: body.message,
                price: tutor[0].fees,
                status: 'pending'
            });

            await this.chatService.createMessage({
                roomID: body.roomid,
                message: `Finalized meeting request (Click this link to accept the session): http://localhost:3000/sessions/${session.sessionid}?a=accept`,
                author: req.user.id,
                ts: new Date().getTime().toString(),
                isRead: false
            })

            return res.status(HttpStatus.OK).json({message: `Session has been successfully requested.`});
        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Put(':id')
    @UseGuards(AuthGuard())
    async updateSession(
        @Request() req,
        @Response() res,
        @Body() body,
        @Param('id') id
    ){
        try{
            if(body.date && !moment(body.date).isValid() && moment(body.date).isBefore(new Date)){
                throw Error('Time is invalid.');
            }

            const newFields = {
                location: body.location,
                message: body.message,
                date: body.date,
                price: body.price,
                acceptedByStudent: false,
                acceptedByTeacher: false
            }

            const user = await this.userService.findUserById(req.user.id);

            const session = await this.sessionsService.getSessionById(id);

            if(!session){
                throw Error('Could not find the session.');
            }

            if(session.teacherid !== user.id && session.studentid !== user.id){
                throw Error(`You're not allowed to change the session information.`);
            }

            if(session.teacherid === user.id){
                newFields.acceptedByTeacher = true;
            }

            await this.chatService.createMessage({
                roomID: session.roomid,
                message: `I've changed the finalized meeting request. Please take a look here: http://localhost:3000/sessions/${id}`,
                author: req.user.id,
                ts: new Date().getTime().toString(),
                isRead: false
            })

            await this.sessionsService.updateSession(id, newFields);

            return res.status(HttpStatus.OK).json({
                message: 'Session has been updated.'
            })

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Post(':id/cancel')
    @UseGuards(AuthGuard())
    async cancelSession(
        @Request() req,
        @Response() res,
        @Param('id') id
    ){
        try{
            const user = _.first(await this.tutorsService.getTutorById(req.user.id));

            if(!user){
                throw Error('Cannot find the user account.');
            }

            const session = await this.sessionsService.getSessionById(id);

            if(!session){
                throw Error('Cannot find the session.');
            }

            if(session.acceptedByStudent){
                throw Error('Student has already paid for the session.');
            }

            await this.sessionsService.updateSession(id, {
                acceptedByTeacher: false
            })

            return res.status(HttpStatus.OK).json({
                message: 'Session has been successfully updated.'
            })

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Post(':id/accept')
    @UseGuards(AuthGuard())
    async acceptSession(
        @Request() req,
        @Response() res,
        @Param('id') id,
        @Body() body
    ){
        try{
            const user = await this.userService.findUserById(req.user.id);

            if(!user){
                throw Error('User is invalid.');
            }

            const session = await this.sessionsService.getSessionById(id);

            if(!session){
                throw Error('Session ID is invalid.');
            }

            if(user.id === session.teacherid){
                await this.sessionsService.updateSession(session.sessionid, {acceptedByTeacher: true});

                await this.chatService.createMessage({
                    roomID: session.roomid,
                    message: `I've accepted the request: (Follow this link to confirm and pay). http://localhost:3000/sessions/${id}?a=accept`,
                    author: req.user.id,
                    ts: new Date().getTime().toString(),
                    isRead: false
                })

                return res.status(HttpStatus.ACCEPTED).send();
            }

            if(user.id === session.studentid){
                if(!session.acceptedByTeacher){
                    throw Error('Tutor has to accept the session first.');
                }

                if(!body.nonce){
                    throw Error('You have to pay for the session first.');
                }

                let result;

                if(body.nonce === 'FREE'){
                    if(session.price !== 0){
                        throw Error('You have to pay for the session first.');
                    }

                    result = {transaction: {id: 'FREE'}};
                }else{
                    result = await this.transactionsService.createTransaction(body.nonce, session.price);

                    if(!result.success){
                        throw Error(result.message);
                    }
                }

                await this.sessionsService.updateSession(session.sessionid, {acceptedByStudent: true, status: 'paid'});

                await this.chatService.createMessage({
                    roomID: session.roomid,
                    message: `The appointment has been set, here are the details: http://localhost:3000/sessions/${id}`,
                    author: req.user.id,
                    ts: new Date().getTime().toString(),
                    isRead: false,
                    isSystem: true
                })

                await this.transactionsService.createTransactionRecord({
                    date: moment().toISOString(),
                    sessionid: session.sessionid,
                    userid: req.user.id,
                    tutorid: session.teacherid,
                    status: PaymentStatus.Pending,
                    price: session.price
                })

                await this.transactionsService.createPaymentRecord({
                    date: moment().toISOString(),
                    userid: req.user.id,
                    type: PaymentType.In,
                    amount: session.price,
                    fees: Number.prototype.toFixed.call(session.price * 0.1, 2),
                    paymentid: result.transaction.id
                })

                const tutor = _.first(await this.tutorsService.getTutorById(session.teacherid)) as any;

                await this.externalService.sendMessage(tutor.phone, `You have a confirmed meeting. Go to http://localhost:3000/sessions/${session.sessionid} to see the details.`);

                return res.status(HttpStatus.ACCEPTED).send();
            }

            throw Error('Oops.. Something went wrong.');

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }
}
