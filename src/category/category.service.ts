import { BadRequestException, Injectable } from '@nestjs/common';
import UserInfoDto from '../auth/dto/userinfo.dto';
import { UserService } from '../user/user.service';
import CreateCategoryDto from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import Category from './entities/category.entity';
import { Repository } from 'typeorm';
import UpdateCategoryNameDto from './dto/update-category-name.dto';
import UpdateCategoryDto from './dto/update-category.dto';
import UpdateCategoryNumberDto from './dto/update-category-number.dto';
import UpdateCategoryIsUsedDto from './dto/update-category-isused.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  async findAll() {
    try {
      return await this.categoryRepository.find({ order: { number: 'ASC' } });
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
      return await this.categoryRepository.update(id, {
        name,
        number,
        isUsed,
        accessible,
        createdAt,
      });
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
        throw new BadRequestException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new BadRequestException('관리자 권한이 없습니다.');
      }
      const existName = await this.findAllByName(name);
      if (existName.length >= 1) {
        throw new BadRequestException('해당 카테고리가 이미 존재합니다.');
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

  async updateName(id: number, dto: UpdateCategoryNameDto, user: UserInfoDto) {
    try {
      const { email, roles } = user;
      const { name } = dto;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new BadRequestException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new BadRequestException('관리자 권한이 없습니다.');
      }
      const foundCategory = await this.findOneById(id);
      if (!foundCategory) {
        throw new BadRequestException('선택하신 카테고리는 존재하지 않습니다.');
      }
      const existName = await this.findAllByName(name);
      if (existName.length >= 1) {
        throw new BadRequestException('해당 카테고리가 이미 존재합니다.');
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
      let { number } = dto;
      const foundUser = await this.userService.findUserbyEmail(email);
      if (!foundUser) {
        throw new BadRequestException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new BadRequestException('관리자 권한이 없습니다.');
      }
      const foundCategory = await this.findOneById(id);
      if (!foundCategory) {
        throw new BadRequestException('선택하신 카테고리는 존재하지 않습니다.');
      }
      const categories = await this.findAll();
      let header = 0;
      let fallower = 0;

      if (number === 1) {
        fallower = categories[number - 1].number;
        number = Math.round((header + fallower) / 2 + 10);
      } else if (number === categories.length) {
        header = categories[number - 2].number;
        number = Math.round(header + fallower + 100);
      } else {
        header = categories[number - 2].number;
        fallower = categories[number - 1].number;
        number = Math.round((header + fallower) / 2 + 10);
      }
      const updatingData = {
        name: foundCategory.name,
        number,
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
        throw new BadRequestException('해당 계정이 존재하지 않습니다.');
      }
      if (!roles.includes('ADMIN')) {
        throw new BadRequestException('관리자 권한이 없습니다.');
      }
      const foundCategory = await this.findOneById(id);
      if (!foundCategory) {
        throw new BadRequestException('선택하신 카테고리는 존재하지 않습니다.');
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

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
