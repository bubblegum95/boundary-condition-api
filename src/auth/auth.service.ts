import { BadRequestException, Injectable } from '@nestjs/common';
import AdminSignUpDto from './dto/admin-signup.dto';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async findRoleAdminAddr(dto: AdminSignUpDto) {
    try {
      const foundAddr = await this.userService.findAdminAddress(dto);
      return foundAddr;
    } catch (error) {
      throw error;
    }
  }

  async issueToken(email: string, id: number) {
    try {
      const payload = {
        email,
        sub: id,
      };
      const token = this.jwtService.sign(payload);

      return token;
    } catch (error) {
      throw error;
    }
  }

  async verifyRoleAdmin(dto: AdminSignUpDto) {
    try {
      const { email, id } = await this.findRoleAdminAddr(dto);

      if (!email) {
        throw new BadRequestException(
          '관리자 계정 비밀번호가 일치하지 않습니다.'
        );
      }

      const token = await this.issueToken(email, id);

      if (!token) {
        throw new Error('토큰을 발급할 수 없습니다.');
      }

      return token;
    } catch (error) {
      throw error;
    }
  }
}
