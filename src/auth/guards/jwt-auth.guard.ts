import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authorizationHeader = request.headers['Authorization'];

      if (!authorizationHeader) {
        return false;
      }

      const { type, token } = authorizationHeader.split(' ');

      if (type !== 'Bearer') {
        return false;
      }

      const user = this.jwtService.verify(token);
      request.user = user;

      return true;
    } catch (e) {
      return false;
    }
  }
}
