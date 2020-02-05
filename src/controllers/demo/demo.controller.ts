import { Controller, Body, HttpStatus, Response, Post } from '@nestjs/common';
import * as Mailgun from 'mailgun-js';

const MailgunApi = 'key-65add53a60be85d006d8f07f7bcf25a8';

@Controller('demo')
export class DemoController {
    mailgun: any;

    constructor(){
        this.mailgun = Mailgun({apiKey: MailgunApi, domain: 'mg.turon.co'});
    }

    async sendEmail(email, message){
        try{
            const data = {
                from: 'Turon.co <no-reply@mg.turon.co>',
                to: email,
                subject: 'Turon Demo request',
                html: message
            };
    
            await new Promise((resolve, reject) => {
                this.mailgun.messages().send(data, function (error, body) {
                    if(error){
                        reject(error);
                        return;
                    }
    
                    resolve(body);
                });
            })
    
        }catch(e){
            console.log(e);
        }
    }

    @Post()
    async requestDemo(
        @Response() res,
        @Body() body
    ){
        try{
            if(!(body.first_name && body.last_name && body.email && body.school)){
                throw Error('Invalid request. Please try again.');
            }

            const message = `<h1>You got new demo request</h1><br />
                <strong>First name:</strong> ${body.first_name}<br />
                <strong>Last name:</strong> ${body.last_name}<br />
                <strong>School:</strong> ${body.school}<br />
                <strong>Email:</strong> ${body.email}<br />
                <strong>Phone:</strong> ${body.phone || ''}<br />
                <strong>Comments:</strong> ${body.comments || ''}`

            await this.sendEmail('nick@turon.co', message);

            return res.status(200).send({
                message: 'Your request has been successfully submitted.'
            })

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }
}
