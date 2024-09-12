import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import AdminSignUpDto from './dto/admin-signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/admin')
  async signUpAdmin(@Body() dto: AdminSignUpDto) {}
}
