import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleWithLinkDto } from './dto/create-article-with-link.dto';
import { UpdateArticleWithLinkDto } from './dto/update-article-with-link.dto';
import CreateArticleWithImageDto from './dto/create-article-with-image.dto';
import { UserInfo } from '../utils/user-info.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import UserInfoDto from '../auth/dto/userinfo.dto';
import { Express, Response } from 'express';
import {
  ApiBody,
  ApiConsumes,
  ApiExcludeEndpoint,
  ApiHideProperty,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import FindArticleQueryDto from './dto/find-article-query.dto';
import UpdateArticleWithImageDto from './dto/update-article-with-image.dto';
import UpdateIsPublicDto from './dto/update-is-public.dto';
import { SearchArticleQueryDto } from './dto/search-article-query.dto';
import ReturnFindCategoryListDto from './resDto/find-category-list.dto';
import { ReturnFindArticlesAdminDto } from './resDto/find-articles-admin.dto';
import { ReturnFindArticlesDto } from './resDto/find-articles.dto';
import { ReturnFindArticleForAdminDto } from './resDto/find-article-admin.dto';

@ApiTags('Article')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({
    summary: '아티클 생성',
    description: '썸네일 이미지 링크 삽입시',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: CreateArticleWithLinkDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post('admin')
  async createArticleWithLink(
    @Res() res: Response,
    @Body() dto: CreateArticleWithLinkDto,
    @UserInfo() user: UserInfoDto
  ) {
    try {
      await this.articleService.createArticleWithLink(dto, user);
      return res.status(HttpStatus.CREATED).json({
        message: '아티클 생성 완료',
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: error.message,
      });
    }
  }

  @ApiExcludeEndpoint()
  @ApiHideProperty()
  @ApiOperation({
    summary: '아티클 생성',
    description: '썸네일 이미지 파일 첨부시',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateArticleWithImageDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post('admin/image')
  @UseInterceptors(FileInterceptor('image'))
  async createArticleWithImage(
    @Body() dto: CreateArticleWithImageDto,
    @UploadedFile() image: Express.Multer.File,
    @UserInfo() user: UserInfoDto,
    @Res() res: Response
  ) {
    try {
      await this.articleService.createArticleWithImage(dto, user, image);
      return res.status(HttpStatus.CREATED).json({
        message: `아티클 생성 완료`,
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '아티클을 생성할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '관리자 아티클 목록 조회',
    description: '관리자 아티클 목록 조회',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOkResponse({
    description: '아티클 목록을 조회합니다.',
    type: ReturnFindArticlesAdminDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async findAll(
    @Res() res: Response,
    @Query() query: FindArticleQueryDto,
    @UserInfo() user: UserInfoDto
  ) {
    try {
      const articles = await this.articleService.findAllForAdmin(user, query);
      return res.status(HttpStatus.OK).json({
        message: '아티클 목록을 조회합니다.',
        data: articles,
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '아티클 목록을 조회할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '관리자 아티클 단일 조회',
    description: '관리자 아티클 단일 조회',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOkResponse({
    description: '아티클을 조회합니다.',
    type: ReturnFindArticleForAdminDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  async findOne(
    @Res() res: Response,
    @Param('id') id: number,
    @UserInfo() user: UserInfoDto
  ) {
    try {
      const article = await this.articleService.findOneForAdmin(user, id);
      return res.status(HttpStatus.OK).json({
        message: '아티클을 조회합니다.',
        data: article,
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '아티클을 조회할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 수정',
    description: '썸네일 이미지 링크 삽입시',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: UpdateArticleWithLinkDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id')
  async updateArticleWithUrl(
    @Param('id') id: number,
    @Body() dto: UpdateArticleWithLinkDto,
    @UserInfo() user: UserInfoDto,
    @Res() res: Response
  ) {
    try {
      console.log(dto);
      const data = await this.articleService.updateArticleWithLink(
        +id,
        dto,
        user
      );

      return res.status(HttpStatus.OK).json({
        message: '아티클 수정을 완료하였습니다.',
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '아티클을 수정할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiExcludeEndpoint()
  @ApiHideProperty()
  @ApiOperation({
    summary: '아티클 수정',
    description: '썸네일 이미지 파일 첨부시',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateArticleWithImageDto,
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Patch('admin/image/:id')
  async updateArticleWithImage(
    @UserInfo() user: UserInfoDto,
    @Param('id') id: number,
    @Body() dto: UpdateArticleWithImageDto,
    @UploadedFile() image: Express.Multer.File,
    @Res() res: Response
  ) {
    try {
      await this.articleService.updateArticleWithImage(+id, dto, image, user);
      return res.status(HttpStatus.OK).json({
        message: '아티클 수정을 완료하였습니다.',
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '아티클을 수정할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 공개 여부 수정',
    description: '아티클 공개 여부 수정',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: UpdateIsPublicDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('admin/is-public/:id')
  async updateIsPublic(
    @Body() dto: UpdateIsPublicDto,
    @Param('id') id: number,
    @UserInfo() user: UserInfoDto,
    @Res() res: Response
  ) {
    try {
      await this.articleService.updateIsPublic(user, id, dto);
      return res.status(HttpStatus.OK).json({
        message: '아티클 공개여부를 수정하였습니다.',
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '아티클 공개여부를 수정할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 삭제',
    description: '아티클 삭제',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  async remove(
    @Param('id') id: string,
    @UserInfo() user: UserInfoDto,
    @Res() res: Response
  ) {
    try {
      await this.articleService.remove(+id, user);
      return res.status(HttpStatus.OK).json({
        message: '아티클을 삭제하였습니다.',
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '아티클을 삭제할 수 없습니다.',
        error: error.message,
      });
    }
  }

  // 사용자 페이지
  @ApiOperation({
    summary: '아티클 조회',
    description: '아티클 카테고리 및 키워드 조회',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOkResponse({
    description: '아티클 목록을 조회합니다.',
    type: ReturnFindArticlesDto,
  })
  @Get()
  async findAllForUser(
    @Query() dto: SearchArticleQueryDto,
    @Res() res: Response
  ) {
    try {
      const data = await this.articleService.findAllForUser(dto);
      return res.status(HttpStatus.OK).json({
        message: '아티클을 조회합니다.',
        data: data,
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '아티클을 조회할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 조회',
    description: '지도페이지 내 아티클 조회',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOkResponse({
    description: '아티클 목록을 조회합니다.',
    type: ReturnFindArticlesDto,
  })
  @Get('map')
  async findInMap(@Res() res: Response) {
    try {
      const data = await this.articleService.findInMap();
      return res.status(HttpStatus.OK).json({
        message: '아티클을 조회합니다.',
        data,
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '아티클을 조회할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: '아티클 카테고리 isUsed: true인 카테고리 목록 조회',
    description: '아티클 카테고리 isUsed: true인 카테고리만 조회',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOkResponse({
    description: '카테고리 목록을 조회합니다.',
    type: ReturnFindCategoryListDto,
  })
  @Get('categories')
  async findPartcial(@Res() res: Response) {
    try {
      const categories = await this.articleService.findCategoriesUsing();
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
}
