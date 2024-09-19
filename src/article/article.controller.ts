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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import FindArticleQueryDto from './dto/find-article-query.dto';
import UpdateArticleWithImageDto from './dto/update-article-with-image.dto';
import UpdateExposableDto from './dto/update-exposable.dto';
import FindArticlesDto from './dto/find-articles.dto';
import { SearchArticleQueryDto } from './dto/search-article-query.dto';

@ApiTags('Article')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // 관리자 페이지(아티클)
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
    type: [FindArticlesDto],
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
    @Body() updateArticleDto: UpdateArticleWithLinkDto,
    @UserInfo() user: UserInfoDto,
    @Res() res: Response
  ) {
    try {
      const data = this.articleService.updateArticleWithLink(
        +id,
        updateArticleDto,
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
    summary: '아티클 수정',
    description: '아티클 지도 페이지 노출 허용 여부 수정',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: UpdateExposableDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('admin/exposable/:id')
  async updateExposable(
    @Body() dto: UpdateExposableDto,
    @Param('id') id: number,
    @UserInfo() user: UserInfoDto,
    @Res() res: Response
  ) {
    try {
      await this.articleService.updateExposable(user, id, dto);
      return res.status(HttpStatus.OK).json({
        message: '아티클 지도노출여부를 수정하였습니다.',
      });
    } catch (error) {
      let status = error.status;
      if (!status) {
        status = HttpStatus.BAD_REQUEST;
      }
      return res.status(status).json({
        message: '아티클 지도노출여부를 수정할 수 없습니다.',
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
}
