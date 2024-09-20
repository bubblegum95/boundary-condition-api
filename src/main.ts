import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './swagger/setupSwagger';
import { ValidationPipe } from '@nestjs/common';
import { RedisIoAdapter } from './redis/redis-io-adapter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.enableCors({
    origin: ['http://ggair.co.kr', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });
  setupSwagger(app);
  // websocket adapter 설정
  // const socketPort = configService.get<number>('SOCKET_PORT');
  // const redisIoAdapter = new RedisIoAdapter(app, socketPort);
  // const redisHost = configService.get<string>('REDIS_HOST');
  // const redisPort = configService.get<number>('REDIS_PORT');
  // await redisIoAdapter.connectToRedis(redisHost, redisPort);
  // app.useWebSocketAdapter(redisIoAdapter);

  const port = configService.get<number>('SERVER_PORT');
  await app.listen(port);
}
bootstrap();
