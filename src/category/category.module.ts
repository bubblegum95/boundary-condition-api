import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../user/entities/user.entity';
import Category from './entities/category.entity';
import Article from '../article/entities/article.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([User, Category, Article])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
