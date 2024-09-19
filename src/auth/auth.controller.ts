import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import AdminSignInDto from './dto/admin-signin.dto';
import { Response } from 'express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import AdminSignUpDto from './dto/admin-signup.dto';

@ApiTags('Auth')
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
  @Post('admin/signin')
  async signInAdmin(@Body() dto: AdminSignInDto, @Res() res: Response) {
    try {
      const token = await this.authService.signInAdmin(dto);
      res.setHeader('Authorization', `Bearer ${token}`);
      return res.status(HttpStatus.OK).json({
        message: '관리자 페이지에 로그인하였습니다',
      });
    } catch (error) {
      return res.status(error.status).json({
        message: `관리자 페이지에 로그인할 수 없습니다.`,
        error: error.message,
      });
    }
  }

  @ApiConsumes('application/json')
  @ApiOperation({
    summary: '관리자 계정 회원가입',
    description: '관리자 계정 회원가입',
  })
  @ApiBody({
    type: AdminSignUpDto,
  })
  @Post('admin/signup')
  async signUpAdmin(@Body() dto: AdminSignUpDto, @Res() res: Response) {
    try {
      const admin = await this.authService.signUpAdmin(dto);

      return res.status(HttpStatus.CREATED).json({
        message: '관리자 회원가입을 완료하였습니다.',
        data: admin,
      });
    } catch (error) {
      return res.status(error.status).json({
        message: '관리자 회원가입이 불가능합니다.',
        error: error.message,
      });
    }
  }
}
