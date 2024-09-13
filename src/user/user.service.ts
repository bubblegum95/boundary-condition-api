import { BadRequestException, Injectable } from '@nestjs/common';
import AdminSignUpDto from '../auth/dto/admin-signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import AdminSignInDto from '../auth/dto/admin-signin.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async findUserbyEmail(email: string) {
    try {
      return await this.userRepository.findOne({
        where: { email },
        relations: ['userRoles', 'userRoles.role'],
      });
    } catch (error) {
      throw error;
    }
  }

  async findAdminAddress(dto: AdminSignInDto) {
    try {
      const { email, password } = dto;
      const user = await this.findUserbyEmail(email);

      if (!user) {
        throw new BadRequestException('일치하는 계정이 없습니다.');
      }

      const isPassword = await this.verifyPassword(password, user.password);

      if (!isPassword) {
        throw new BadRequestException('비밀번호가 일치하지 않습니다.');
      }

      return {
        email: user.email,
        id: user.id,
        roles: user.userRoles.map((userRole) => userRole.role.name),
      };
    } catch (error) {
      throw error;
    }
  }

  async signUpAdmin(dto: AdminSignUpDto) {
    try {
      const { name, username, email, password } = dto;
      const hashedpassword = bcrypt.hash(password);
      const user = this.userRepository.save({
        name,
        username,
        email,
        password: hashedpassword,
        verified: false,
        agreed: false,
      });
      console.log(user);
    } catch (error) {
      throw error;
    }
  }
}
