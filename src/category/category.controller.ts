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
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiExcludeEndpoint,
  ApiHideProperty,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserInfo } from '../utils/user-info.decorator';
import UserInfoDto from '../auth/dto/userinfo.dto';
import CreateCategoryDto from './dto/create-category.dto';
import { Response } from 'express';
import UpdateCategoryNumberDto from './dto/update-category-number.dto';
import UpdateCategoryIsUsedDto from './dto/update-category-isused.dto';
import UpdateCategoryAccessibleDto from './dto/update-category-accessible.dto';
import FindCategoriesDto from './dto/find-categories.dto';

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
      return res.status(HttpStatus.CREATED).json({
        message: '카테고리를 생성하였습니다.',
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '카테고리를 생성할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 카테고리 이름 목록 조회',
    description: '아티클 카테고리 이름 목록 조회',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('list')
  async findCategoryList(@Res() res: Response) {
    try {
      const data = await this.categoryService.findCategoryList();
      return res.status(HttpStatus.CREATED).json({
        message: '카테고리 이름 목록을 조회합니다.',
        data,
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '카테고리 이름 목록 조회를 할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 카테고리 목록 조회',
    description: '아티클 카테고리 목록 조회',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOkResponse({
    description: '카테고리 목록을 조회합니다.',
    type: [FindCategoriesDto],
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Res() res: Response, @UserInfo() user: UserInfoDto) {
    try {
      const categories = await this.categoryService.findAllForAdmin(user);
      return res.status(HttpStatus.OK).json({
        message: '카테고리 목록을 조회합니다.',
        data: categories,
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '카테고리 목록을 조회할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 카테고리 목록 조회',
    description: '아티클 카테고리 isUsed: true인 카테고리만 조회',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOkResponse({
    description: '카테고리 목록을 조회합니다.',
    type: [FindCategoriesDto],
  })
  @Get('is-used')
  async findPartcial(@Res() res: Response) {
    try {
      const categories = await this.categoryService.findUsed();
      return res.status(HttpStatus.OK).json({
        message: '카테고리 목록을 조회합니다.',
        data: categories,
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
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
    type: CreateCategoryDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('admin/name/:id')
  async updateName(
    @Param('id') id: number,
    @Body() dto: CreateCategoryDto,
    @UserInfo() user: UserInfoDto,
    @Res() res: Response
  ) {
    try {
      await this.categoryService.updateName(+id, dto, user);
      return res.status(HttpStatus.OK).json({
        message: '카테고리 이름을 수정하였습니다.',
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
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
    type: UpdateCategoryNumberDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('admin/number/:id')
  async updateNumber(
    @Param('id') id: number,
    @Body() dto: UpdateCategoryNumberDto,
    @UserInfo() user: UserInfoDto,
    @Res() res: Response
  ) {
    try {
      const data = await this.categoryService.updateNumber(+id, dto, user);
      return res.status(HttpStatus.OK).json({
        message: '카테고리 순번을 변경하였습니다.',
        data,
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '카테고리 순번을 변경할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 카테고리 사용여부 수정',
    description: '아티클 카테고리 사용여부 수정',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: UpdateCategoryIsUsedDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('admin/is-used/:id')
  async updateIsUsed(
    @Param('id') id: number,
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
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '카테고리 사용여부를 변경할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiExcludeEndpoint()
  @ApiHideProperty()
  @ApiOperation({
    summary: '아티클 카테고리 비회원 사용자 접근 허용 여부 수정',
    description: '아티클 카테고리 비회원 사용자 접근 허용 여부 수정',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: UpdateCategoryAccessibleDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('admin/accessible/:id')
  async updateAccessible(
    @Param('id') id: number,
    @Body() dto: UpdateCategoryAccessibleDto,
    @UserInfo() user: UserInfoDto,
    @Res() res: Response
  ) {
    try {
      await this.categoryService.updateAccessible(+id, dto, user);
      return res.status(HttpStatus.OK).json({
        message: '카테고리 비회원사용자 접근 허용 여부를 변경하였습니다.',
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '카테고리 비회원사용자 접근 허용 여부를 변경할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 카테고리 삭제',
    description: '아티클 카테고리 삭제',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  async remove(
    @Param('id') id: number,
    @UserInfo() user: UserInfoDto,
    @Res() res: Response
  ) {
    try {
      await this.categoryService.remove(+id, user);
      return res.status(HttpStatus.OK).json({
        message: '카테고리를 삭제하였습니다.',
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '카테고리를 삭제할 수 없습니다.',
        error: error.message,
      });
    }
  }
}
