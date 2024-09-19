import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import AdminSignInDto from './dto/admin-signin.dto';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import AdminSignUpDto from './dto/admin-signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async issueToken(email: string, id: number, roles: string[]) {
    try {
      const payload = {
        email,
        sub: id,
        roles,
      };
      console.log('payload: ', payload);
      const token = this.jwtService.sign(payload);

      return token;
    } catch (error) {
      throw error;
    }
  }

  async signUpAdmin(dto: AdminSignUpDto) {
    try {
      const { name, username, email, password } = dto;
      const data = {
        name,
        username,
        email,
        password,
        phone: null,
        address: null,
        agreed: true,
      };
      const isEmail = await this.userService.findUserbyEmail(email);

      if (isEmail) {
        throw new BadRequestException('이미 존재하는 이메일입니다.');
      }

      const admin = await this.userService.makeUserAddr(data);
      const role = await this.userService.findRole('ADMIN');
      const madeUserRole = await this.userService.makeRoleRelation(
        admin.id,
        role.id
      );

      return admin.email;
    } catch (error) {
      throw error;
    }
  }

  async signInAdmin(dto: AdminSignInDto) {
    try {
      const { email, password } = dto;
      const user = await this.userService.findUserbyEmail(email);
      if (!user) {
        throw new NotFoundException('일치하는 계정이 없습니다.');
      }
      const isPassword = await this.userService.verifyPassword(
        password,
        user.password
      );
      if (!isPassword) {
        throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
      }
      const roles = await this.userService.findUserRole(user.id);
      if (!roles.includes('ADMIN')) {
        throw new UnauthorizedException('관리자 권한이 없습니다.');
      }
      const token = await this.issueToken(email, user.id, roles);
      return token;
    } catch (error) {
      throw error;
    }
  }
}
