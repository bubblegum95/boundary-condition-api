import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const authCookie = request.cookies['authorization'];
      if (!authCookie) {
        throw new UnauthorizedException('인증 토큰이 없습니다.');
      }

      const [type, token] = authCookie.split(' ');
      if (type !== 'Bearer') {
        throw new BadRequestException('인증 형식이 일치하지 않습니다.');
      }
      const user = this.jwtService.verify(token);
      if (!user) {
        throw new NotFoundException('사용자 정보가 없습니다.');
      }
      request.user = user;

      return true;
    } catch (error) {
      throw error;
    }
  }
}
