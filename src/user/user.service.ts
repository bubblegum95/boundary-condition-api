import { Injectable } from '@nestjs/common';
import AdminSignUpDto from '../auth/dto/admin-signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from './type/role.type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findAdminAddress(dto: AdminSignUpDto) {
    try {
      const { password } = dto;
      const foundAddr = await this.userRepository.findOne({
        where: [{ role: Role.Admin }, { password }],
      });

      return foundAddr;
    } catch (error) {
      throw error;
    }
  }

  async findUserbyEmail(email: string) {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      throw error;
    }
  }
}
