import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import Article from './entities/article.entity';
import { UserService } from '../user/user.service';
import { CategoryService } from '../category/category.service';
import { Readable } from 'stream';
import { join } from 'path';
import * as fs from 'fs';
import Thumbnail from './entities/thumbnail.entity';
import Category from '../category/entities/category.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateArticleWithLinkDto } from './dto/create-article-with-link.dto';
import UserInfoDto from '../auth/dto/userinfo.dto';
import User from '../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import FindArticleQueryDto from './dto/find-article-query.dto';
import { FindArticlesAdminDto } from './resDto/find-articles-admin.dto';

describe('ArticleService', () => {
  let articleService: ArticleService;
  let dataSource: DataSource;
  let userService: UserService;
  let categoryService: CategoryService;
  let mockArticleRepository = {
    save: jest.fn(),
    findOne: jest.fn().mockImplementation((data) => {
      if (data) {
        return Article;
      }
    }),
    find: jest.fn().mockImplementation((dto) => {
      if (dto === (dto as FindArticleQueryDto)) {
        const value = [
          {
            id: 1,
            createdAt: new Date(),
            category: { id: 1, name: 'category' },
          },
        ] as Article[];
        return value;
      }
    }),
  };
  let mockDataSource = {
    createQueryRunner: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockReturnThis(),
      startTransaction: jest.fn().mockReturnThis(),
      commitTransaction: jest.fn().mockReturnThis(),
      rollbackTransaction: jest.fn().mockReturnThis(),
      release: jest.fn().mockReturnThis(),
      manager: {
        save: jest.fn().mockImplementation((entity, data) => {
          if (entity === Thumbnail) {
            return { id: 1, ...data } as Category;
          } else if (entity === Article) {
            return { id: 1, ...data } as Article;
          }
          return null;
        }),
      } as Partial<EntityManager>,
    })) as jest.MockedFunction<any>,
  };
  let mockUserService = {
    findUserbyEmail: jest.fn(),
  };
  let mockCategoryService = {
    findOneByName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockArticleRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    articleService = module.get<ArticleService>(ArticleService);
    dataSource = module.get<DataSource>(DataSource);
    userService = module.get<UserService>(UserService);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save a thumbnail image file', async () => {
    const mockReadableStream = new Readable();
    mockReadableStream.push('test image buffer data');
    mockReadableStream.push(null);

    const image: Express.Multer.File = {
      fieldname: 'thumbnail',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      destination: './uploads',
      filename: 'test-image.jpg',
      path: './uploads/test-image.jpg',
      buffer: Buffer.from('test image buffer'),
      stream: mockReadableStream,
    };

    const imageName = image.originalname;
    const path = join(__dirname, '..', 'thumbnail', imageName);
    const writeStream = await fs.createWriteStream(path);
    writeStream.write(image.buffer);
    writeStream.end();

    const result = await articleService.saveThumbnailImage(image);
    const value = path;
    expect(result).toEqual(value);
  });

  it('should create thumbnail', async () => {
    const path = '링크경로';
    const queryRunner = mockDataSource.createQueryRunner();
    const value = { id: 1, path };
    const result = await articleService.createThumbnail(path, queryRunner);
    expect(result).toEqual(value);
    expect(queryRunner.manager.save).toHaveBeenCalledWith(Thumbnail, { path });
  });

  it('should find category by name', async () => {
    const name = 'category';
    const value = mockCategoryService.findOneByName(name) as Category;
    const result = await articleService.findCategoryByName(name);
    expect(result).toEqual(value);
  });

  it('should form date', () => {
    const date = new Date();
    const year = new Date(date).getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const value = `${year}.${month}.${day}`;
    const result = articleService.filterDate(date);
    expect(result).toEqual(value);
  });

  it('should find a category by id', async () => {
    const id = 1;
    const value = await mockArticleRepository.findOne(id);
    const result = await articleService.findOneById(id);
    expect(result).toEqual(value);
  });

  it('should save article', async () => {
    const dto = {
      userId: 1,
      title: 'title',
    } as CreateArticleDto;
    const queryRunner = mockDataSource.createQueryRunner();
    const savedArticleResult = queryRunner.manager.save;
    const value = {
      id: 1,
      ...dto,
    };
    const result = await articleService.saveArticle(dto, queryRunner);
    expect(result).toEqual(value);
    expect(savedArticleResult).toHaveBeenCalledWith(Article, dto);
  });

  it('should create article with link', async () => {
    const dto = {
      title: 'title 입니다',
      category: 'category',
      thumbnail: '썸네일이미지경로',
    } as CreateArticleWithLinkDto;

    const user = {
      email: 'email 입니다',
      roles: ['ADMIN'],
    } as UserInfoDto;

    const foundUser = {
      id: 1,
    } as User;

    const foundCategory = {
      id: 1,
      name: 'category',
    } as Category;

    const savedThumbnail = {
      id: 1,
      path: dto.thumbnail,
    } as Thumbnail;

    const savedArticle = {
      id: 1,
      title: '여기지롱',
    } as Article;

    const articleDto = {
      userId: foundUser.id,
      title: dto.title,
      categoryId: foundCategory.id,
      thumbnailId: savedThumbnail.id,
    } as CreateArticleDto;

    mockUserService.findUserbyEmail.mockResolvedValue(foundUser);
    articleService.findCategoryByName = jest
      .fn()
      .mockResolvedValue(foundCategory);
    articleService.createThumbnail = jest
      .fn()
      .mockResolvedValue(savedThumbnail);
    articleService.saveArticle = jest.fn().mockResolvedValue(savedArticle);

    const queryRunner = mockDataSource.createQueryRunner();
    jest
      .spyOn(mockDataSource, 'createQueryRunner')
      .mockReturnValue(queryRunner);
    const result = await articleService.createArticleWithLink(dto, user);

    expect(result).toEqual(true);
    expect(queryRunner.connect).toHaveBeenCalled();
    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockUserService.findUserbyEmail).toHaveBeenCalledWith(user.email);
    expect(articleService.findCategoryByName).toHaveBeenCalledWith(
      dto.category
    );
    expect(articleService.createThumbnail).toHaveBeenCalledWith(
      dto.thumbnail,
      queryRunner
    );
    expect(articleService.saveArticle).toHaveBeenCalledWith(
      articleDto,
      queryRunner
    );
  });

  it('should find all articles for admin page', async () => {
    const query = { limit: 10, page: 1 } as FindArticleQueryDto;
    const foundArticles: Article[] = (await mockArticleRepository.find(
      query
    )) as Article[];
    let value: FindArticlesAdminDto[] = [];
    foundArticles.map((foundArticle) => {
      const filteredDate = articleService.filterDate(foundArticle.createdAt);
      const article = {
        id: foundArticle.id,
        createdAt: filteredDate,
        category: foundArticle.category.name,
      } as FindArticlesAdminDto;
      value.push(article);
    });
    const result = await articleService.findAllArticlesForAdmin(query);
    expect(result).toEqual(value);
  });
});
