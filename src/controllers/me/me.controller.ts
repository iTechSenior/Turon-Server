import { AuthService } from './../../services/auth/auth.service';
import { UserService } from './../../services/user/user.service';
import { Controller, Get, Request, Response, HttpStatus, UseGuards, Put, Body, Post, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as _ from 'lodash';

@Controller('me')
export class MeController {
    constructor(
        private userService: UserService,
        private authService: AuthService
    ){}

    @Get('')
    @UseGuards(AuthGuard())
    async getProfile(
        @Request() req
    ){
        return req.user;
    }

    @Get('2fa')
    @UseGuards(AuthGuard())
    async get2faAuth(
        @Request() req,
        @Response() res
    ){
        try{
            const googleToken = await this.authService.get2fa(req.user.id);

            return res.status(HttpStatus.OK).json({token: googleToken});

        }catch({message}){
            return res.status(HttpStatus.BAD_REQUEST).json({message})
        }
    }

    @Post('2fa')
    @UseGuards(AuthGuard())
    async confirm2faAuth(
        @Request() req,
        @Response() res,
        @Body() body
    ){
        try{
            if(!body.token){
                throw Error('Please enter verification token.');
            }

            const MFAConfirmed = await this.authService.confirm2fa(req.user.id, body.token);

            if(!MFAConfirmed){
                throw Error('Something went wrong. Please try again.');
            }

            return res.status(HttpStatus.OK).json({
                status: 200,
                message: '2FA has been successfully set up.'
            })

        }catch({message}){
            return res.status(HttpStatus.BAD_REQUEST).json({message})
        }
    }


    @Put('update')
    @UseGuards(AuthGuard())
    async updateUser(
        @Response() res,
        @Request() req,
        @Body() body
    ){
        try{
            const props = _.pickBy({
                university: body.university,
                email: body.email,
                zipcode: body.zipcode
            }, _.identity);

            if(_.keys(props).length === 0){
                throw Error('Invalid update request. Please try again.');
            }

            const user = await this.userService.updateUser(req.user.id, props);

            return res.status(HttpStatus.OK).json(user);
        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }
}
