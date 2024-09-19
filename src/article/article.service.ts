import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleWithLinkDto } from './dto/update-article-with-link.dto';
import { InjectRepository } from '@nestjs/typeorm';
import Article from './entities/article.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import Category from '../category/entities/category.entity';
import CreateArticleWithImageDto from './dto/create-article-with-image.dto';
import { UserService } from '../user/user.service';
import UserInfoDto from '../auth/dto/userinfo.dto';
import SaveArticleDto from './dto/save-article.dto';
import Thumbnail from './entities/thumbnail.entity';
import * as fs from 'fs';
import { join } from 'path';
import FindArticleQueryDto from './dto/find-article-query.dto';
import UpdateArticleWithImageDto from './dto/update-article-with-image.dto';
import UpdateArticleDto from './dto/update-article.dto';
import { CategoryService } from '../category/category.service';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Thumbnail)
    private readonly thumbnailRepository: Repository<Thumbnail>,
    @InjectRepository(Category)
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly categoryService: CategoryService
  ) {}

  async saveThumbnailImage(image: Express.Multer.File) {
    try {
      const imageName = image.originalname;
      const path = join(__dirname, '..', 'thumbnail', imageName);
      const writeStream = await fs.createWriteStream(path);
      writeStream.write(image.buffer);
      writeStream.end();
      if (!writeStream) {
        throw new Error('이미지를 저장할 수 없습니다.');
      }
      return path;
    } catch (error) {
      throw error;
    }
  }

  async createThumbnail(path: string, queryRunner: QueryRunner) {
    try {
      return await queryRunner.manager.save(Thumbnail, { path });
    } catch (error) {
      throw error;
    }
  }

  async findCategoryByName(name: string) {
    try {
      return await this.categoryService.findOneByName(name);
    } catch (error) {
      throw error;
    }
  }

  filterDate(date: Date) {
    try {
      return new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      throw error;
    }
  }

  async saveArticle(dto: SaveArticleDto, queryRunner: QueryRunner) {
    try {
      const {
        userId,
        title,
        subtitle,
        thumbnailId,
        link,
        categoryId,
        exposable,
      } = dto;
      return await queryRunner.manager.save(Article, {
        userId,
        title,
        subtitle,
        thumbnailId,
        link,
        categoryId,
        exposable,
      });
    } catch (error) {
      throw error;
    }
  }

  async findAllArticlesForAdmin(query: FindArticleQueryDto) {
    try {
      const { items, page } = query;
      const foundArticles = await this.articleRepository.find({
        relations: ['category', 'thumbnail'],
        skip: (page - 1) * items,
        take: items,
      });
      let articleArr = [];
      foundArticles.map((foundArticle) => {
        const filteredDate = this.filterDate(foundArticle.createdAt);
        const article = {
          id: foundArticle.id,
          title: foundArticle.title,
          category: foundArticle.category.name,
          exposable: foundArticle.exposable,
          createdAt: filteredDate,
        };
        articleArr.push(article);
      });
      return articleArr;
    } catch (error) {
      throw error;
    }
  }

  async createArticleWithLink(dto: CreateArticleDto, user: UserInfoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { title, subtitle, thumbnail, link, category, exposable } = dto;
      const { email, roles } = user;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new BadRequestException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new BadRequestException('해당 계정에 관리자 권한이 없습니다.');
      }
      const foundCategory = await this.findCategoryByName(category);
      if (!foundCategory) {
        throw new BadRequestException('해당 카테고리가 존재하지 않습니다.');
      }
      const savedThumbnail = await this.createThumbnail(thumbnail, queryRunner);
      if (!savedThumbnail) {
        throw new BadRequestException('썸네일을 저장할 수 없습니다.');
      }
      const articleDto = {
        userId: foundUser.id,
        title,
        subtitle,
        thumbnailId: savedThumbnail.id,
        link,
        categoryId: foundCategory.id,
        exposable,
      };
      const savedArticle = await this.saveArticle(articleDto, queryRunner);
      if (!savedArticle) {
        throw new BadRequestException('아티클을 저장할 수 없습니다.');
      }
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createArticleWithImage(
    dto: CreateArticleWithImageDto,
    user: UserInfoDto,
    image: Express.Multer.File
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { title, subtitle, link, category, exposable } = dto;
      const { email, roles } = user;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new BadRequestException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new BadRequestException('해당 계정에 관리자 권한이 없습니다.');
      }
      const foundCategory = await this.findCategoryByName(category);
      if (!foundCategory) {
        throw new BadRequestException('해당 카테고리가 존재하지 않습니다.');
      }
      const path = await this.saveThumbnailImage(image);
      if (!path) {
        throw new BadRequestException('해당 이미지를 저장할 수 없습니다.');
      }
      const savedThumbnail = await this.createThumbnail(path, queryRunner);
      if (!savedThumbnail) {
        throw new BadRequestException('썸네일을 저장할 수 없습니다.');
      }
      const articleDto = {
        userId: foundUser.id,
        title,
        subtitle,
        thumbnailId: savedThumbnail.id,
        link,
        categoryId: foundCategory.id,
        exposable,
      };
      const savedArticle = await this.saveArticle(articleDto, queryRunner);
      if (!savedArticle) {
        throw new BadRequestException('아티클을 저장할 수 없습니다.');
      }
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(user: UserInfoDto, query: FindArticleQueryDto) {
    const { email, roles } = user;
    const foundUser = await this.userService.findUserbyEmail(email);
    if (!foundUser) {
      throw new BadRequestException('해당 계정이 존재하지 않습니다.');
    }
    if (!roles.includes('ADMIN')) {
      throw new BadRequestException('해당 계정에 관리자 권한이 없습니다.');
    }
    const articles = await this.findAllArticlesForAdmin(query);
    return articles;
  }

  async findOne(id: number) {
    try {
      return await this.articleRepository.findOne({
        where: { id },
        relations: ['thumbnail', 'category'],
      });
    } catch (error) {
      throw error;
    }
  }

  async findArticle(id: number) {
    try {
      const article = await this.findOne(id);
      return {
        id: article.id,
        title: article.title,
        subtitle: article.subtitle,
        link: article.link,
        thumbnail: article.thumbnail.path,
        category: article.category.name,
        exposeble: article.exposable,
        createdAt: article.createdAt,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateArticle(
    id: number,
    dto: UpdateArticleDto,
    queryRunner: QueryRunner
  ) {
    try {
      const {
        userId,
        title,
        subtitle,
        thumbnailId,
        link,
        categoryId,
        exposable,
        createdAt,
      } = dto;

      return await queryRunner.manager.save(Article, {
        id,
        data: {
          userId,
          title,
          subtitle,
          thumbnailId,
          link,
          categoryId,
          exposable,
          createdAt,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async findExposibleArticle() {
    try {
      return await this.articleRepository.find({ where: { exposable: true } });
    } catch (error) {
      throw error;
    }
  }

  async updateArticleWithLink(
    id: number,
    dto: UpdateArticleWithLinkDto,
    user: UserInfoDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, roles } = user;
      let { title, subtitle, link, thumbnail, category, exposable } = dto;
      let thumbnailId = 0;
      let categoryId = 0;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new BadRequestException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new BadRequestException('해당 계정에 관리자 권한이 없습니다.');
      }
      const foundArticle = await this.findOne(id);
      if (!foundArticle) {
        throw new BadRequestException('해당 아티클이 존재하지 않습니다.');
      }
      if (!title) {
        title = foundArticle.title;
      }
      if (!subtitle) {
        subtitle = foundArticle.subtitle;
      }
      if (!link) {
        link = foundArticle.link;
      }
      if (!exposable) {
        exposable = foundArticle.exposable;
      }
      if (!thumbnail) {
        thumbnailId = foundArticle.thumbnail.id;
      } else {
        thumbnailId = (await this.createThumbnail(thumbnail, queryRunner)).id;
      }
      if (!category) {
        categoryId = foundArticle.categoryId;
      } else {
        const foundCategory = await this.findCategoryByName(category);
        categoryId = foundCategory.id;
      }
      const savingArticle = {
        userId: foundArticle.userId,
        title,
        subtitle,
        link,
        thumbnailId,
        categoryId,
        exposable,
        createdAt: foundArticle.createdAt,
      };
      const updatedData = await this.updateArticle(
        foundArticle.id,
        savingArticle,
        queryRunner
      );

      return true;
    } catch (error) {
      queryRunner.rollbackTransaction();
      throw error;
    } finally {
      queryRunner.release();
    }
  }

  async updateArticleWithImage(
    id: number,
    dto: UpdateArticleWithImageDto,
    image: Express.Multer.File,
    user: UserInfoDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, roles } = user;
      let { title, subtitle, link, category, exposable } = dto;
      let categoryId = 0;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new BadRequestException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new BadRequestException('관리자 권한이 없습니다.');
      }
      const foundArticle = await this.findOne(id);
      if (!foundArticle) {
        throw new BadRequestException('해당 아티클이 존재하지 않습니다.');
      }
      if (!title) {
        title = foundArticle.title;
      }
      if (!subtitle) {
        subtitle = foundArticle.subtitle;
      }
      if (!link) {
        link = foundArticle.link;
      }
      if (!exposable) {
        exposable = foundArticle.exposable;
      }
      if (!category) {
        categoryId = foundArticle.categoryId;
      } else {
        const foundCategory = await this.findCategoryByName(category);
        categoryId = foundCategory.id;
      }
      const savedImage = await this.saveThumbnailImage(image);
      const savedthumbnail = await this.createThumbnail(
        savedImage,
        queryRunner
      );
      const savingArticle = {
        userId: foundArticle.userId,
        title,
        subtitle,
        link,
        thumbnailId: savedthumbnail.id,
        categoryId,
        exposable,
        createdAt: foundArticle.createdAt,
      };

      const updatedData = await this.updateArticle(
        foundArticle.id,
        savingArticle,
        queryRunner
      );
      return true;
    } catch (error) {
      queryRunner.rollbackTransaction();
      throw error;
    } finally {
      queryRunner.release();
    }
  }

  async updateExposable(user: UserInfoDto, id: number, exposable: boolean) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, roles } = user;
      const existUser = await this.userService.findUserbyEmail(email);
      if (!existUser) {
        throw new BadRequestException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new BadRequestException('관리자 권한이 없습니다.');
      }
      const foundArticle = await this.findOne(id);
      if (!foundArticle) {
        throw new BadRequestException('해당 아티클이 존재하지 않습니다.');
      }
      const dto = {
        userId: foundArticle.userId,
        title: foundArticle.title,
        subtitle: foundArticle.subtitle,
        link: foundArticle.link,
        thumbnailId: foundArticle.thumbnailId,
        categoryId: foundArticle.categoryId,
        exposable,
        createdAt: foundArticle.createdAt,
      };
      await this.updateArticle(id, dto, queryRunner);
      return true;
    } catch (error) {
      queryRunner.rollbackTransaction();
      throw error;
    } finally {
      queryRunner.release();
    }
  }

  async remove(id: number, user: UserInfoDto) {
    try {
      const { email, roles } = user;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new BadRequestException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new BadRequestException('관리자 권한이 없습니다.');
      }
      const foundArticle = await this.findArticle(id);
      if (!foundArticle) {
        throw new BadRequestException('해당 아티클이 존재하지 않습니다.');
      }
      await this.articleRepository.delete({ id });
      return true;
    } catch (error) {
      throw error;
    }
  }
}
