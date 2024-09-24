import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import UserInfoDto from '../auth/dto/userinfo.dto';
import { UserService } from '../user/user.service';
import CreateCategoryDto from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import Category from './entities/category.entity';
import { Repository } from 'typeorm';
import UpdateCategoryDto from './dto/update-category.dto';
import UpdateCategoryNumberDto from './dto/update-category-number.dto';
import UpdateCategoryIsUsedDto from './dto/update-category-isused.dto';
import UpdateCategoryAccessibleDto from './dto/update-category-accessible.dto';
import Article from '../article/entities/article.entity';

@Injectable()
export class CategoryService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>
  ) {}

  filterDate(date: Date) {
    try {
      const newDate = new Date(date);
      const year = newDate.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      // '0000.00.00' 형식으로 조합
      const formattedDate = `${year}.${month}.${day}`;
      return formattedDate;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.categoryRepository.find({ order: { number: 'ASC' } });
    } catch (error) {
      throw error;
    }
  }

  async findUsed() {
    try {
      const categories = await this.categoryRepository.find({
        where: { isUsed: true },
        order: { number: 'ASC' },
      });
      let arr = [];
      const data = categories.map((category) => {
        const resDto = {
          id: category.id,
          name: category.name,
        };
        arr.push(resDto);
      });
      return arr;
    } catch (error) {
      throw error;
    }
  }

  async findOneById(id: number) {
    try {
      return await this.categoryRepository.findOne({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  async findOneByName(name: string) {
    try {
      return await this.categoryRepository.findOne({ where: { name } });
    } catch (error) {
      throw error;
    }
  }

  async findAllByName(name: string) {
    try {
      return await this.categoryRepository.find({ where: { name } });
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    try {
      const { name, number, isUsed, accessible, createdAt } = dto;
      const updated = await this.categoryRepository.update(id, {
        name,
        number,
        isUsed,
        accessible,
        createdAt,
      });
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async findAllForAdmin(user: UserInfoDto) {
    try {
      const { email, roles } = user;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new NotFoundException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new UnauthorizedException('관리자 권한이 없습니다.');
      }
      let categories = await this.findAll();
      let arr = [];
      categories.map((category) => {
        const filteredDate = this.filterDate(category.createdAt);
        const data = {
          id: category.id,
          name: category.name,
          isUsed: category.isUsed,
          createdAt: filteredDate,
        };
        arr.push(data);
      });
      return arr;
    } catch (error) {
      throw error;
    }
  }

  async createCategory(user: UserInfoDto, dto: CreateCategoryDto) {
    try {
      const { email, roles } = user;
      const { name } = dto;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new NotFoundException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new UnauthorizedException('관리자 권한이 없습니다.');
      }
      const existName = await this.findAllByName(name);
      if (existName.length >= 1) {
        throw new ConflictException('해당 카테고리가 이미 존재합니다.');
      }
      const categories = await this.findAll();
      const number = (categories.length + 1) * 1000;
      await this.categoryRepository.save({
        name,
        number,
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  async updateName(id: number, dto: CreateCategoryDto, user: UserInfoDto) {
    try {
      const { email, roles } = user;
      const { name } = dto;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new NotFoundException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new UnauthorizedException('관리자 권한이 없습니다.');
      }
      const foundCategory = await this.findOneById(id);
      if (!foundCategory) {
        throw new NotFoundException('선택하신 카테고리는 존재하지 않습니다.');
      }
      const existName = await this.findAllByName(name);
      if (existName.length >= 1) {
        throw new ConflictException('해당 카테고리가 이미 존재합니다.');
      }
      const updatingData = {
        name,
        number: foundCategory.number,
        isUsed: foundCategory.isUsed,
        accessible: foundCategory.accessible,
        createdAt: foundCategory.createdAt,
      };
      await this.updateCategory(id, updatingData);

      return true;
    } catch (error) {
      throw error;
    }
  }

  async updateNumber(
    id: number,
    dto: UpdateCategoryNumberDto,
    user: UserInfoDto
  ) {
    try {
      const { email, roles } = user;
      let { num } = dto;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new NotFoundException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new UnauthorizedException('관리자 권한이 없습니다.');
      }
      const foundCategory = await this.findOneById(id);
      if (!foundCategory) {
        throw new NotFoundException('선택하신 카테고리는 존재하지 않습니다.');
      }
      const categories = await this.findAll();
      let header = 0;
      let fallower = 0;

      if (num === 1) {
        fallower = categories[num - 1].number;
        num = Math.round((header + fallower) / 2 + 10);
      } else if (num === categories.length) {
        header = categories[num - 2].number;
        num = Math.round(header + fallower + 100);
      } else {
        header = categories[num - 2].number;
        fallower = categories[num - 1].number;
        num = Math.round((header + fallower) / 2 + 10);
      }
      const updatingData = {
        name: foundCategory.name,
        number: num,
        isUsed: foundCategory.isUsed,
        accessible: foundCategory.accessible,
        createdAt: foundCategory.createdAt,
      };
      await this.updateCategory(id, updatingData);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async updateIsUsed(
    id: number,
    dto: UpdateCategoryIsUsedDto,
    user: UserInfoDto
  ) {
    try {
      const { email, roles } = user;
      let { isUsed } = dto;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new NotFoundException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new UnauthorizedException('관리자 권한이 없습니다.');
      }
      const foundCategory = await this.findOneById(id);
      if (!foundCategory) {
        throw new NotFoundException('선택하신 카테고리는 존재하지 않습니다.');
      }
      const updatingData = {
        name: foundCategory.name,
        number: foundCategory.number,
        isUsed,
        accessible: foundCategory.accessible,
        createdAt: foundCategory.createdAt,
      };
      await this.updateCategory(id, updatingData);

      return true;
    } catch (error) {
      throw error;
    }
  }

  async updateAccessible(
    id: number,
    dto: UpdateCategoryAccessibleDto,
    user: UserInfoDto
  ) {
    try {
      const { email, roles } = user;
      let { accessible } = dto;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new NotFoundException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new UnauthorizedException('관리자 권한이 없습니다.');
      }
      const foundCategory = await this.findOneById(id);
      if (!foundCategory) {
        throw new NotFoundException('선택하신 카테고리는 존재하지 않습니다.');
      }
      const updatingData = {
        name: foundCategory.name,
        number: foundCategory.number,
        isUsed: foundCategory.isUsed,
        accessible,
        createdAt: foundCategory.createdAt,
      };
      await this.updateCategory(id, updatingData);

      return true;
    } catch (error) {
      throw error;
    }
  }

  async findArticleWithCategory(categoryId: number) {
    try {
      const articles = await this.articleRepository.find({
        where: { categoryId },
      });
      return articles.filter((article) => article.id);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number, user: UserInfoDto) {
    try {
      const { email, roles } = user;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new NotFoundException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new UnauthorizedException('관리자 권한이 없습니다.');
      }
      const foundCategory = await this.findOneById(id);
      if (!foundCategory) {
        throw new NotFoundException('선택하신 카테고리는 존재하지 않습니다.');
      }
      const foundArticles = await this.findArticleWithCategory(
        foundCategory.id
      );
      if (foundArticles.length !== 0) {
        throw new BadRequestException(
          `해당 카테고리를 아티클에서 사용중입니다.`
        );
      }
      await this.categoryRepository.delete({ id });
    } catch (error) {
      throw error;
    }
  }
}
