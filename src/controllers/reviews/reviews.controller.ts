import { ChatService } from './../../services/chat/chat.service';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Controller, Get, Param, HttpStatus, Response, Request, UseGuards, Query, Post, Body } from '@nestjs/common';
import { ReviewsService } from '../../services/reviews/reviews.service';
import { Repository } from 'typeorm';

@Controller('reviews')
export class ReviewsController {
    constructor(
        private reviewsService: ReviewsService,
        private chatService: ChatService
    ){}

    @Get(':id')
    async getReview(
        @Response() res,
        @Param('id') id,
        @Query('sid') sid
    ){
        try{
            let canLeaveReview = false;

            if(sid){
                const studentReviews = await this.reviewsService.getReviews({tutor: id, student: sid});
                const studentMessages = await this.chatService.getRooms({
                    requester: sid,
                    responder: id
                })

                canLeaveReview = !!(!studentReviews.length && studentMessages.length);
            }

            const reviews = await this.reviewsService.getReviews({tutor: id});

            return res.status(HttpStatus.OK).send({
                reviews: reviews,
                canLeaveReview: canLeaveReview
            })

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Post(':id')
    @UseGuards(AuthGuard())
    async createReview(
        @Response() res,
        @Request() req,
        @Param('id') id,
        @Body() body
    ){
        try{
            await this.reviewsService.createReview({
                rating: body.rating,
                message: body.message,
                date: new Date(),
                student: req.user.id,
                tutor: id
            })

            const reviews = await this.reviewsService.getReviews({
                tutor: id
            })

            return res.status(HttpStatus.OK).json({
                reviews: reviews,
                canLeaveReview: false
            })

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }
}
