import { Controller, Get, Query, Response, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import * as request from 'request-promise';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('linkedin')
  async getLinkedin(
    @Response() res,
    @Query('code') code
  ) {
    try{
      if(!code){
        throw Error('Code is not defined');
      }
  
      const response = await request('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          json: true,
          form: {
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: process.env.LINKEDIN_REDIRECT_URL,
              client_id: process.env.LINKEDIN_CLIENT_ID,
              client_secret: process.env.LINKEDIN_CLIENT_SECRET
          }
      })
  
      if(!response.access_token){
          throw Error('Invalid access token');
      }
  
      const user = await request('https://api.linkedin.com/v1/people/~:(id,firstName,lastName,email-address)?format=json', {
          headers: {
              'Authorization': `Bearer ${response.access_token}`
          },
          json: true
      })
  
      return res.status(HttpStatus.OK).send(user);

    }catch(e){
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: e.message
      })
    }
    
  }
}
