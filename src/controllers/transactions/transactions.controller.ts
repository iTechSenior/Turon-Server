import { AuthService } from './../../services/auth/auth.service';
import { TransactionsService } from './../../services/transactions/transactions.service';
import { UserService } from './../../services/user/user.service';
import { Controller, Get, UseGuards, HttpStatus, Request, Response, Req, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TutorsService } from './../../services/tutors/tutors.service';
import * as _ from 'lodash';
import * as validator from 'validator';
import * as moment from 'moment';
import { PaymentType } from '../../interfaces/Payments';

@Controller('transactions')
export class TransactionsController {
    constructor(
        private userService: UserService,
        private tutorsService: TutorsService,
        private transactionsService: TransactionsService,
        private authService: AuthService
    ){}

    @Get()
    @UseGuards(AuthGuard())
    async createToken(
        @Request() req,
        @Response() res
    ){
        try{
            const user = await this.userService.findUserById(req.user.id);

            if(!user){
                throw Error('User is not found.');
            }

            const token = await this.transactionsService.createToken();

            return res.status(HttpStatus.OK).json({
                token: token
            })

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Get('payments')
    @UseGuards(AuthGuard())
    async getAllPayments(
        @Request() req,
        @Response() res
    ){
        try{
            const user = await this.userService.findUserById(req.user.id);

            if(!user){
                throw Error('Cannot find the tutor account.');
            }

            const payments = await this.transactionsService.getAllPayments(req.user.id, !user.tutor);

            return res.status(HttpStatus.OK).json(payments);
        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Get('payout')
    @UseGuards(AuthGuard())
    async payout(
        @Request() req,
        @Response() res
    ){
        try{
            const user = _.first(await this.tutorsService.getTutorById(req.user.id)) as any;

            if(!user || !user.tutorid){
                throw Error('Invalid request.');
            }

            const info = await this.transactionsService.getPayoutInfo(req.user.id);

            return res.status(HttpStatus.OK).json(info);

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Post('payout')
    @UseGuards(AuthGuard())
    async requestPayout(
        @Request() req,
        @Response() res,
        @Body() body
    ){
        try{
            const user = _.first(await this.tutorsService.getTutorById(req.user.id)) as any;

            if(!user || !user.tutorid){
                throw Error('Invalid request.');
            }

            if(!(body.email && validator.isEmail(body.email))){
                throw Error('Please enter valid email.');
            }

            if(!body.code || body.code.length !== 6){
                throw Error('Please enter valid code.');
            }

            const isValid = await this.authService.verify2fa(req.user.id, body.code);

            if(!isValid){
                throw Error('You entered invalid code.');
            }

            const {payout_batch_id, amount, fees} = await this.transactionsService.requestPayout(req.user.id, body.email) as any;

            await this.transactionsService.createPaymentRecord({
                paymentid: payout_batch_id,
                userid: req.user.id,
                date: moment().toISOString(),
                amount: amount,
                fees: fees,
                type: PaymentType.Out
            })

            return res.status(HttpStatus.CREATED).json();

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }
}