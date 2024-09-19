import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Article from './entities/article.entity';
import Category from '../category/entities/category.entity';
import { AuthModule } from '../auth/auth.module';
import Thumbnail from './entities/thumbnail.entity';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Category, Thumbnail]),
    AuthModule,
    UserModule,
    JwtModule,
    CategoryModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
