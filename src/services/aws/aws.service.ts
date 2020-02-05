import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid/v1';
import * as _ from 'lodash';
import { TutorsService } from '../tutors/tutors.service';
import { Tutors } from 'dist/entities/tutors.entity';
import { Repository, Not, Equal } from 'typeorm';

@Injectable()
export class AwsService {
    private s3: any;

    constructor(
        @InjectRepository(Tutors) private readonly tutorsModel: Repository<Tutors>,
    ){
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        })
    }

    // async updateAllPictures(){
    //     const profiles = await this.tutorsModel.find({
    //         profile: Not(Equal('/assets/default_profile.png'))
    //     })

    //     for(let i of profiles){
    //         console.log(i.id);
    //         const profUrl = await this.uploadPicture(i.profile);

    //         await this.tutorsModel.update({id: i.id}, {profile: profUrl});
    //     }
    // }

    async uploadPicture(base64){
        return new Promise<string>((resolve, reject) => {
            const mime = _.replace(_.first(_.split(base64, ';')), 'data:', '');
            const extension = _.replace(mime, 'image/', '');
            const buff = new Buffer(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            const key = `${uuid()}.${extension}`

            const params = {
                Bucket: 'turon-profiles',
                Key: key,
                Body: buff,
                ContentEncoding: 'base64',
                ContentType: mime,
                ACL: 'public-read'
            }

            this.s3.putObject(params, (err, data) => {
                if(err){
                    console.log(err);
                    return reject(new Error('Oops.. Error occurred while uploading to the storage.'))
                };

                resolve(`https://turon-profiles.s3-us-west-1.amazonaws.com/${key}`);
            });
        });
    }
}
