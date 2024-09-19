import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserInfo } from '../utils/user-info.decorator';
import UserInfoDto from '../auth/dto/userinfo.dto';
import CreateCategoryDto from './dto/create-category.dto';
import { Response } from 'express';
import UpdateCategoryNameDto from './dto/update-category-name.dto';
import UpdateCategoryNumberDto from './dto/update-category-number.dto';
import UpdateCategoryIsUsedDto from './dto/update-category-isused.dto';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({
    summary: '아티클 카테고리 생성',
    description: '아티클 카테고리 생성',
  })
  @ApiBody({
    type: CreateCategoryDto,
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @UseGuards(JwtAuthGuard)
  @Post('admin')
  async createCategory(
    @UserInfo() user: UserInfoDto,
    @Body() dto: CreateCategoryDto,
    @Res() res: Response
  ) {
    try {
      await this.categoryService.createCategory(user, dto);
      return res.status(HttpStatus.OK).json({
        message: '카테고리를 생성하였습니다.',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: '카테고리를 생성할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 카테고리 목록 조회',
    description: '아티클 카테고리 목록 조회',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Get()
  findAll(@Res() res: Response) {
    try {
      const categories = this.categoryService.findAll();
      return res.status(HttpStatus.OK).json({
        message: '카테고리 목록을 조회합니다.',
        data: categories,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: '카테고리 목록을 조회할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 카테고리 이름 수정',
    description: '아티클 카테고리 이름 수정',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: UpdateCategoryNameDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('admin/name/:id')
  async updateName(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryNameDto,
    @UserInfo() user: UserInfoDto,
    @Res() res: Response
  ) {
    try {
      await this.categoryService.updateName(+id, dto, user);
      return res.status(HttpStatus.OK).json({
        message: '카테고리 이름을 수정하였습니다.',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: '카테고리 이름을 수정할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 카테고리 순번 수정',
    description: '아티클 카테고리 순번 수정',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: UpdateCategoryNameDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('admin/number/:id')
  async updateNumber(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryNumberDto,
    @UserInfo() user: UserInfoDto,
    @Res() res: Response
  ) {
    try {
      await this.categoryService.updateNumber(+id, dto, user);
      return res.status(HttpStatus.OK).json({
        message: '카테고리 순번을 변경하였습니다.',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: '카테고리 순번을 변경할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 카테고리 순번 수정',
    description: '아티클 카테고리 순번 수정',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: UpdateCategoryIsUsedDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('admin/is-used/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryIsUsedDto,
    @UserInfo() user: UserInfoDto,
    @Res() res: Response
  ) {
    try {
      await this.categoryService.updateIsUsed(+id, dto, user);
      return res.status(HttpStatus.OK).json({
        message: '카테고리 사용여부를 변경하였습니다.',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: '카테고리 사용여부를 변경할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
