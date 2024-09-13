import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import AdminSignInDto from './dto/admin-signin.dto';
import { Response } from 'express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiConsumes('application/json')
  @ApiOperation({
    summary: '관리자 계정 로그인',
    description: '관리자 계정 로그인',
  })
  @ApiBody({
    type: AdminSignInDto,
  })
  @Post('signup/admin')
  async signUpAdmin(@Body() dto: AdminSignInDto, @Res() res: Response) {
    try {
      const token = await this.authService.verifyRoleAdmin(dto);
      return res
        .status(HttpStatus.OK)
        .json({
          message: '관리자 페이지 로그인 성공',
        })
        .setHeader('Authorization', `Bearer ${token}`);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `관리자 페이지에 로그인할 수 없습니다. ${error.message}`,
      });
    }
  }
}
