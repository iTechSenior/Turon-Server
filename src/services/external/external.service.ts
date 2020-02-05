import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';

const TwillioAccountSid = 'ACac9aa470fafc7e2de434c6000c52f909';
const TwillioAuthToken = '5cca296152b561e7f574fb83c5eb114f';

@Injectable()
export class ExternalService {
    private twilio: any;

    constructor(){
        this.twilio = twilio(TwillioAccountSid, TwillioAuthToken);
    }

    async sendMessage(to, body){
        await this.twilio.messages.create({
            body: body,
            to: to,
            from: '+15594254145'
        })
    }
}
