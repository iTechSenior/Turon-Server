import { UserService } from './../../services/user/user.service';
import { AuthService } from './../../services/auth/auth.service';
import { Controller, Post, Body, Response, HttpStatus } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UserService
    ){}

    @Post('login')
    async login(
        @Response() res,
        @Body() body
    ){
        try{
            if(body.facebook_id){
                const token = await this.authService.loginWithFacebook(body.facebook_id);

                if(!token){
                    throw Error('Could not find your account.');
                }
    
                return res.status(HttpStatus.OK).json(token);
            }

            if(body.google_id){
                const token = await this.authService.loginWithGoogle(body.google_id);

                if(!token){
                    throw Error('Could not find your account.');
                }
    
                return res.status(HttpStatus.OK).json(token);
            }

            if(body.linkedin_id){
                const token = await this.authService.loginWithLinkedin(body.linkedin_id);

                if(!token){
                    throw Error(`Could not find your account.`);
                }
    
                return res.status(HttpStatus.OK).json(token);
            }

            if(!(body.email && body.password)){
                throw Error('Email or password is required.');
            }

            const token = await this.authService.login(body.email, body.password);

            if(!token){
                throw Error('Invalid email or password.');
            }

            return res.status(HttpStatus.OK).json(token);

        }catch(e){
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: e.message
            })
        }
    }

    @Post('signup')
    async signup(
        @Response() res,
        @Body() body
    ){
        try{
            const userData = {
                university: body.university || '',
                firstName: body.firstName || '',
                lastName: body.lastName || '',
                email: body.email || '',
                password: body.password || '',
                zipcode: body.zipcode || ''
            }

            if(body.facebook_id){
                const user = await this.authService.loginWithFacebook(body.facebook_id);

                if(user){
                    return res.status(HttpStatus.OK).json(user);
                }

                const token = await this.authService.signup({...userData, facebook_id: body.facebook_id});

                return res.status(HttpStatus.OK).json(token);
            }

            if(body.google_id){
                const user = await this.authService.loginWithGoogle(body.google_id);

                if(user){
                    return res.status(HttpStatus.OK).json(user);
                }

                const token = await this.authService.signup({...userData, google_id: body.google_id});

                return res.status(HttpStatus.OK).json(token);
            }

            if(body.linkedin_id){
                const user = await this.authService.loginWithLinkedin(body.linkedin_id);

                if(user){
                    return res.status(HttpStatus.OK).json(user);
                }

                const token = await this.authService.signup({...userData, linkedin_id: body.linkedin_id});

                return res.status(HttpStatus.OK).json(token);
            }

            if(!userData.email || !userData.password){
                throw Error('Email or password is missing.');
            }

            const userExists = await this.userService.findUserByEmail(userData.email);

            if(userExists){
                throw Error('User is already registered with this email.');
            }
        
            await this.authService.signup(userData);

            const user = await this.userService.findUserByEmail(userData.email);

            return res.status(200).send(user);

        }catch(e){
            return res.status(400).send({message: e.message});
        }
    }
}
