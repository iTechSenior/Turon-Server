import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true
  });

  dotenv.config();

  app.enableCors();

  await app.listen(3001);
}
bootstrap();
