import { User } from './../../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as uuidv1 from 'uuid/v1';
import * as base32 from 'thirty-two';
import * as notp from 'notp';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userModel: Repository<User>,
        private jwtService: JwtService
    ){}

    public async validate(payload){
        return await this.userModel.findOne({id: payload.id}).then((data) => {
            if(data){
                delete data.password;
            }

            return data;
        })
    }

    public async login(email, password): Promise<any>{
        return await this.userModel.findOne({email, password}).then((userData) => {
            if(!userData){
                return;
            }

            const payload = JSON.stringify({
                id: userData.id,
                isAdmin: userData.isAdmin
            })
            const accessToken = this.jwtService.sign(payload);

            delete userData.password;

            if(!userData){
                delete userData.isAdmin;
            }

            return {
                expires_in: 3600 * 24,
                access_token: accessToken,
                user: userData
            };
        })
    }

    public async signup(user){
        const user_id = uuidv1();
        await this.userModel.insert({...user, id: user_id})

        return await this.userModel.findOne({id: user_id}).then((userData) => {
            if(!userData){
                return;
            }

            const payload = JSON.stringify({
                id: userData.id,
                isAdmin: userData.isAdmin
            })
            const accessToken = this.jwtService.sign(payload);

            delete userData.password;
            
            if(!userData){
                delete userData.isAdmin;
            }

            return {
                expires_in: 3600 * 24,
                access_token: accessToken,
                user: userData
            };
        })
    }

    public async loginWithFacebook(facebook_id){
        return await this.userModel.findOne({facebook_id}).then((userData) => {
            if(!userData){
                return;
            }

            const payload = JSON.stringify({
                id: userData.id,
                isAdmin: userData.isAdmin
            })
            const accessToken = this.jwtService.sign(payload);

            delete userData.password;
            
            if(!userData){
                delete userData.isAdmin;
            }

            return {
                expires_in: 3600 * 24,
                access_token: accessToken,
                user: userData
            };
        })
    }

    public async loginWithGoogle(google_id){
        return await this.userModel.findOne({google_id}).then((userData) => {
            if(!userData){
                return;
            }

            const payload = JSON.stringify({
                id: userData.id,
                isAdmin: userData.isAdmin
            })
            const accessToken = this.jwtService.sign(payload);

            delete userData.password;
            
            if(!userData){
                delete userData.isAdmin;
            }

            return {
                expires_in: 3600 * 24,
                access_token: accessToken,
                user: userData
            };
        })
    }

    public async loginWithLinkedin(linkedin_id){
        return await this.userModel.findOne({linkedin_id}).then((userData) => {
            if(!userData){
                return;
            }

            const payload = JSON.stringify({
                id: userData.id,
                isAdmin: userData.isAdmin
            })
            const accessToken = this.jwtService.sign(payload);

            delete userData.password;
            
            if(!userData){
                delete userData.isAdmin;
            }

            return {
                expires_in: 3600 * 24,
                access_token: accessToken,
                user: userData
            };
        })
    }

    async get2fa(id: string){
        const user = await this.userModel.findOne({id});

        if(!user){
            throw Error('Could not find the user.');
        }

        const secretKey = uuidv1();

        await this.userModel.update({id}, {MFA_secret: secretKey, MFA_confirmed: false});

        const encodedForGoogle = base32.encode(secretKey).toString().replace(/=/g,'');

        return `otpauth://totp/${user.email}?secret=${encodedForGoogle}&issuer=Turon`;
    }

    async confirm2fa(id: string, token: string){
        const user = await this.userModel.findOne({id});

        if(!user){
            throw Error('Could not find the user.');
        }

        if(user.MFA_confirmed){
            throw Error('Token has already been confirmed.');
        }

        if(!notp.totp.verify(token, user.MFA_secret)){
            throw Error('Invalid token.');
        }

        await this.userModel.update({id}, {MFA_confirmed: true});

        return true;
    }

    async verify2fa(id: string, token: string){
        const user = await this.userModel.findOne({id});

        if(!user){
            throw Error('Could not find the user.');
        }

        if(!user.MFA_secret || !user.MFA_confirmed){
            throw Error('User doesn\'t have 2FA setup');
        }

        return notp.totp.verify(token, user.MFA_secret);
    }
}
