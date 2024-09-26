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

describe('ArticleService', () => {
  let articleService: ArticleService;
  let articleRepository: Repository<Article>;
  let dataSource: DataSource;
  let userService: UserService;
  let categoryService: CategoryService;

  const mockArticleRepository = {
    save: jest.fn(),
    findOne: jest.fn().mockImplementation((id) => {
      if (id) {
        return Article;
      }
    }),
  };
  const mockDataSource = {
    createQueryRunner: jest.fn().mockImplementation(() => ({
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
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    })) as jest.MockedFunction<any>,
  };

  const mockUserService = {};
  const mockCategoryService = {
    findOneByName: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: 'ArticleRepository',
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
    articleRepository = module.get<Repository<Article>>('ArticleRepository');
    dataSource = module.get<DataSource>(DataSource);
    userService = module.get<UserService>(UserService);
    categoryService = module.get<CategoryService>(CategoryService);
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
    expect(savedArticleResult).toHaveBeenCalledWith(Article, { dto });
  });
});
