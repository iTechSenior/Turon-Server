import { Transactions } from './entities/transactions.entity';
import { ChatMessages } from './entities/chatmessages.entity';
import { Sessions } from './entities/sessions.entity';
import { ChatRooms } from './entities/chatrooms.entity';
import { CourseInfo } from './entities/courseinfo.entity';
import { CourseEnrollment } from './entities/courseenrollment.entity';
import { User } from './entities/user.entity';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth/auth.service';
import { AuthController } from './controllers/auth/auth.controller';
import { MeController } from './controllers/me/me.controller';
import { JwtStrategy } from './services/auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { UserService } from './services/user/user.service';
import { Colleges } from './entities/colleges.entity';
import { CollegeService } from './services/college/college.service';
import { CollegeController } from './controllers/college/college.controller';
import { TutorsController } from './controllers/tutors/tutors.controller';
import { Tutors } from './entities/tutors.entity';
import { TutorsService } from './services/tutors/tutors.service';
import { CourseInfoService } from './services/courseinfo/courseinfo.service';
import { SubjectsController } from './controllers/subjects/subjects.controller';
import { ReviewsController } from './controllers/reviews/reviews.controller';
import { ReviewsService } from './services/reviews/reviews.service';
import { Reviews } from './entities/reviews.entity';
import { DemoController } from './controllers/demo/demo.controller';
import { SessionsController } from './controllers/sessions/sessions.controller';
import { SessionsService } from './services/sessions/sessions.service';
import { ChatService } from './services/chat/chat.service';
import { TransactionsService } from './services/transactions/transactions.service';
import { TransactionsController } from './controllers/transactions/transactions.controller';
import { ExternalService } from './services/external/external.service';
import { Payments } from './entities/payments.entity';
import { AwsService } from './services/aws/aws.service';
import * as dotenv from 'dotenv';

dotenv.config()

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.SQL_HOST,
      port: parseInt(process.env.SQL_PORT),
      username: process.env.SQL_USERNAME,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),
    JwtModule.register({ secret: 'turon-website-secret' }),
    TypeOrmModule.forFeature([User, Colleges, Tutors, CourseEnrollment, CourseInfo, Reviews, ChatRooms, Sessions, ChatMessages, Transactions, Payments])
  ],
  controllers: [AppController, AuthController, MeController, CollegeController, TutorsController, SubjectsController, ReviewsController, DemoController, SessionsController, TransactionsController],
  providers: [AppService, AuthService, JwtStrategy, UserService, CollegeService, TutorsService, CourseInfoService, ReviewsService, SessionsService, ChatService, TransactionsService, ExternalService, AwsService],
})
export class AppModule {}
