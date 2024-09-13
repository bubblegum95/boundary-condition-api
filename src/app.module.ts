import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { MapModule } from './map/map.module';
import { RedisModule } from './redis/redis.module';
import { WinstonModule } from 'nest-winston';
import { LoggingInterceptor } from './loggingInterceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { winstonConfig } from '../config/winston.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtModule } from './jwt/jwt.module';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: configService.get('POSTGRES_SYNC'),
    logging: ['query', 'error'],
    retryAttempts: 5,
    retryDelay: 3000,
    ssl: {
      rejectUnauthorized: false, // 인증서 검증 비활성화 (신뢰할 수 없는 인증서의 경우)
    },
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot(winstonConfig),
    MapModule,
    RedisModule,
    AuthModule,
    UserModule,
    JwtModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
