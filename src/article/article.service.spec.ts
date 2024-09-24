import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { DataSource, Repository } from 'typeorm';
import Article from './entities/article.entity';
import { UserService } from '../user/user.service';
import { CategoryService } from '../category/category.service';
import { Readable } from 'stream';
import { join } from 'path';
import * as fs from 'fs';

describe('ArticleService', () => {
  let articleService: ArticleService;
  let articleRepository: Repository<Article>;
  let dataSource: DataSource;
  let userService: UserService;
  let categoryService: CategoryService;

  const mockArticleRepository = {
    save: jest.fn(),
  };
  const mockDataSource = {
    save: jest.fn(),
  };
  const mockUserService = {};
  const mockCategoryService = {};
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

  it('should create thumbnail', async () => {});
});
